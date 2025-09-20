const routes = [];
const calls = [];
let globalFetchMocked = false;


// Previously we used an npm package called fetch-mock, but I updated dependencies for security
// Of course they chenged the API and it's now apparently beyond my brain to get it working
// So I'm just doing it myself. And it works!


function mock(cardName, response) {
    if (!globalFetchMocked)
        mockGlobalFetch();

    routes.push({cardName, response});
}


function mockGlobalFetch() {
    global.fetch = async function(...args) {
        calls.push({args, timestamp:Date.now()});

        const url = args[0];
        if (typeof url === 'string') {
            for (const mockRoute of routes) {
                const {cardName, response} = mockRoute;
                if (url.includes(cardName)) {
                    return {
                        json: async () => response
                    }
                }
            }
        }

        // Otherwise we just return undefined and hope that works fine
    }
}


function getSmallestGap() {
    let smallestGap = Infinity;
    for (let index = 1; index < calls.length; index++) {
        const thisStamp = calls[index].timestamp;
        const lastStamp = calls[index - 1].timestamp;
        if (thisStamp !== undefined && lastStamp !== undefined) {
        const gap = thisStamp - lastStamp;
        if (gap < smallestGap)
            smallestGap = gap;
        }
    }
    return smallestGap;
}


module.exports = {mock, calls, getSmallestGap}
