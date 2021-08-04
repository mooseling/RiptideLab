<?php
namespace RtlMtgCardBbCode\BbCode\Formatter;

//reshaped as parser-only for BB Code Manager version 1.3.4
class Base
{
    public static function parseUrlOptions($tag)
    {
        $attributes = explode('" url="', $tag);
        return $attributes;
    }

    public static function parseCardImage($children, $option, $tag, $options, $parentClass)
    {
      $txt = $tag['children'][0];

      $small = null;
      if ($tag['option'] != NULL)
          $small = $tag['option'];

      $cards = preg_split("/[\r\n]/", $txt);

      foreach($cards as &$card) {
          $card = trim($card);
          if (empty($card))
            continue;
          $card = strtolower($card);
          if (strcasecmp($small, "small") == 0)
            $card = self::getEmbeddedCardHtml($card);
          else
            $card = self::getEmbeddedCardHtml($card, 'small');
      }

      return implode("", $cards);
    }

    public static function parseCubeDeck($children, $option, $tag, $options, $parentClass)
    {
        $CARD_WIDTH = 147;
        $TUCKED_WIDTH = 37;
        $title = null;
        $url = null;

        if ($tag['option'] != NULL) {
            if (is_array(Base::parseUrlOptions($tag['option']))
                && count(Base::parseUrlOptions($tag['option'])) > 1) {

                $attributes = Base::parseUrlOptions($tag['option']);
                $title = $attributes[0];
                $url = $attributes[1];
            }
            else {
                $title = $tag['option'];
            }
        }

        if ($title) {
            if ($url) {
                $response = "<h4><a href=\"http://" . $url . "\" target=\"_blank\">" . $title . "</a></h4>";
            }
            else {
                $response = "<h4>" . $title . "</h4>";
            }
        }

        $response .= '<table class="cubedecktable"><tr><td valign="top" style="border:none;">';

        $lines = preg_split("/[\n\r]/", $tag['children'][0]);

        $current_body = '';
        $current_title = '';
        $current_count = 0;
        $land = false;
        $columns = 1;
        $max_width = 0;
        $current_width = 0;

        foreach ($lines as &$line) {

            $line = trim($line);

            if (preg_match('/^([0-9]+)(.*)/', $line, $bits)) {

                // It's got a number. It's a card!
                $card = trim($bits[2]);
                $comment = null;

                // Capture any comments, indicated by # character
                if (strpos($card, '#') !== false) {
                    $nibbles = preg_split('/#/', $card, 2);
                    $card = trim($nibbles[0]);
                    $comment = $nibbles[1];
                }

                $card = str_replace("�", "'", $card);

                $basic = false;
                if (strcasecmp($card, "plains") == 0 || strcasecmp($card, "island") == 0
                    || strcasecmp($card, "swamp") == 0 || strcasecmp($card, "mountain") == 0
                    || strcasecmp($card, "forest") == 0) {
                    $basic = true;
                }

                if ($land && $basic) {

                    // This is the width our tucked train of cards will add to the row
                    $added_width = $CARD_WIDTH + ($bits[1] - 1) * $TUCKED_WIDTH;

                    // Start a new line for basics?
                    if ($added_width + $current_width > $max_width) {

                        $line = '</td></tr><tr><td colspan="' . $columns
                            . '" valign="top" style="border:none;"><div class="cubedeckimage cubedeckland">';

                        $current_width = $added_width;
                    }
                    else {
                        $line = '<div class="cubedeckimage cubedeckland">';
                        $current_width += $added_width;
                    }
                }
                else if ($land) {
                    $line = '<div class="cubedeckimage cubedeckland">';
                    $current_width += $CARD_WIDTH;

                    // Keep track of natural wrapping
                    if ($current_width >= $max_width) {
                        $current_width = 0;
                    }
                }
                else {
                    $line = '<div class="cubedeckimage">';
                }

                $line .= '<a href="http://deckbox.org/mtg/'. $card . '" target="_blank">'
                    . '<img src="http://gatherer.wizards.com/Handlers/Image.ashx?type=card&name='
                    . $card . '" width="160" />'
                    . '</a></div>';

                if ($land && $basic) {
                    for ($i = 1; $i < $bits[1]; $i++) {
                        $line .= '<div class="cubedecktucked cubedeckland">'
                            . '<a href="http://deckbox.org/mtg/'. $card . '" target="_blank">'
                            . '<img src="http://gatherer.wizards.com/Handlers/Image.ashx?type=card&name='
                            . $card . '" width="160" />'
                            . '</a></div>';
                    }
                }
                else {
                    for ($i = 1; $i < $bits[1]; $i++) {
                        $current_body .= $line;

                        if ($land) {
                            $current_width += $CARD_WIDTH;

                            // Keep track of natural wrapping
                            if ($current_width >= $max_width) {
                                $current_width = 0;
                            }
                        }
                    }
                }

                $current_body .= $line;
                $current_count += intval($bits[1]);
            }
            else {

                // No number. Category!
                // If this was not the first one, we put the previous one into the response body.
                if ($current_title != "") {
                    $response .= $current_body . '<br/>';
                }

                if (preg_match("/^Two/", $line)
                    || preg_match("/^Three/", $line) || preg_match("/^Four/", $line)
                    || preg_match("/^Five/", $line) || preg_match("/^Six/", $line)) {
                    $response .= '</td><td valign="top" style="border:none;">';
                    $columns += 1;
                }
                else if (preg_match("/^Land/", $line)) {
                    // Land rows, ahoy! Lock in the number of columns, and the associated maximum width.
                    $response .= '</td></tr><tr><td colspan="' . $columns . '" valign="top" style="border:none;">';
                    $land = true;
                    $max_width = $CARD_WIDTH * $columns;
                }

                $current_title = $line; $current_count = 0; $current_body = '';

            }
        }

        $response .= '<br />' . $current_body;

        $response .= '</td></tr></table>';

        return $response;
    }

    public static function parseTagDeck($children, $option, $tag, $options, $parentClass)
    {
        $title = null;

        if ($tag['option'] != NULL)
        {
            $title = $tag['option'];
        }

        if ($title) {
            $response = "<h4>" . $title . "</h4>";
        }

        $response .= '<table class="cubedeck"><tr><td valign="top" style="border:none;">';

        $lines = preg_split("/[\n\r]/", $tag['children'][0]);

        $current_body = '';
        $current_title = '';
        $current_count = 0;

        foreach ($lines as &$line) {

            $line = trim($line);

            if (preg_match('/^([0-9]+)(.*)/', $line, $bits)) {

                // It's got a number. It's a card!
                $card = trim($bits[2]);
                $comment = null;

                // Capture any comments, indicated by # character
                if (strpos($card, '#') !== false) {
                    $nibbles = preg_split('/#/', $card, 2);
                    $card = trim($nibbles[0]);
                    $comment = $nibbles[1];
                }

                $card = str_replace("�", "'", $card);
                $line = $bits[1] . '&nbsp;<a href="http://deckbox.org/mtg/'. $card .
                    '">' . $card . '</a>';
                if ($comment) {
                    $line .= '&nbsp;#' . $comment;
                }

                $current_body .= $line . '<br/>';
                $current_count += intval($bits[1]);
            }
            else {

                // No number. Category!
                // If this was not the first one, we put the previous one into the response body.
                if ($current_title != "") {

                    $response .= '<span style="font-weight:bold">' . $current_title . ' (' .
                        $current_count . ')</span><br />';
                    $response .= $current_body . '<br/>';

                }

                if (preg_match("/^Sideboard/", $line) || preg_match("/^Land/", $line)) {
                    $response .= '</td><td valign="top" style="border:none;">';
                }

                $current_title = $line; $current_count = 0; $current_body = '';

            }
        }

        $response .= '<span style="font-weight:bold">' . $current_title . ' (' . $current_count .
            ')</span><br />' . $current_body;

        $response .= '</td></tr></table>';

        return $response;
    }

    public static function parseTagCard($children, $option, $tag, $options, $parentClass)
    {
      if ($tag['option'] != NULL)
      {
          $card = $tag['option'];
          $card = strtolower(trim($card));
          preg_match('/([\s0-9-]*)(.*)/', $card, $bits);
          return $bits[1].self::getCardTagHtml($bits[2], $tag['children'][0]);
      }
      else
      {
          @$txt = $tag['children'][0];
          if (!is_string($txt))
            return '';

          $cards = preg_split("/[\r\n]/", $txt);

          foreach($cards as &$card) {
              $card = trim($card);
              $lcCard = strtolower($card);
              preg_match('/([\s0-9-]*)(.*)/', $lcCard, $bits);
              preg_match('/([\s0-9-]*)(.*)/', $card, $origBits);

              $card = $bits[1].self::getCardTagHtml($bits[2], $origBits[2]);
          }

          return implode("<br/>", $cards);
      }
    }


    public static function parseTagTest($children, $option, $tag, $options, $parentClass) {
      $txt = $tag['children'][0];

      $small = null;
      if ($tag['option'] != NULL)
          $small = $tag['option'];

      $cards = preg_split("/[\r\n]/", $txt);

      foreach($cards as &$card) {
          $card = trim($card);
          if (empty($card))
            continue;
          $card = strtolower($card);
          if (strcasecmp($small, "small") == 0)
            $card = self::getEmbeddedCardHtml($card);
          else
            $card = self::getEmbeddedCardHtml($card, 'small');
      }

      return implode("", $cards);
    }

    private static function getEmbeddedCardHtml($cardName, $extraClasses = '') {
      $safeCardName = htmlspecialchars($cardName);
      return "<img class=\"RiptideLab--unloaded-card-image $extraClasses\" src=\"data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D\" data-card-name=\"$safeCardName\" />";
    }



    private static function getCardTagHtml($cardName, $displayText) {
      $safeCardName = htmlspecialchars($cardName);
      $safeDisplayText = htmlspecialchars($displayText);
      $queryString = htmlspecialchars(http_build_query(['q' => $cardName], null, '&', PHP_QUERY_RFC3986));
      return "<a class=RiptideLab--card-hover href=\"https://scryfall.com/search?$queryString\" target=_blank data-card-name=\"$safeCardName\">$safeDisplayText</a>";
    }
}

// $tag['children'], $tag['option'], $tag, $options, $this
