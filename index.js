
const http = require('node:http');
const axios = require('axios');

const hubspot = require('@hubspot/api-client');
const hubspotClient = new hubspot.Client({ accessToken: process.env.APIKEY })
const PORT = 3001
const hostname = '127.0.0.1';





// get deals with hs_is_closed_won=true, filter to year -1 and sort 
async function getDeals() {
  try {
    let rawDeals = []
    let dealSearchRequest = {
        filterGroups: [
            {
                filters: [
                    {
                        propertyName: "hs_is_closed_won",
                        operator: 'GTE',
                        value: 'true'
                    },
                    {
                        propertyName: 'closedate',
                        operator: 'GTE',
                        // refactor: use dynamic value w/ Date().now - etc.
                        value: '2023-01-16T20:21:18.836Z'
                    }
                ]
            }
        ],
        sorts: [{ propertyName: 'closedate', direction: 'DESCENDING' }],
        properties: ['createdate', 'closedate', 'amount', 'dealname', 'hs_is_closed_won'],
        limit: 100,
        after: 0
    }


   
        let response = await hubspotClient.crm.deals.searchApi.doSearch(dealSearchRequest);

        

        // Optimization: this could be recursive
        while(response.paging !== undefined){
            rawDeals = rawDeals.concat(response.results)
            dealSearchRequest.after = Number(response.paging.next.after)
            response = await hubspotClient.crm.deals.searchApi.doSearch(dealSearchRequest);
        }

        //get last page of data from call
        response = await hubspotClient.crm.deals.searchApi.doSearch(dealSearchRequest);
        rawDeals = rawDeals.concat(response.results)
        
        //clean up raw deals array
        let dealsCache = rawDeals.map(deal => deal.properties)

        //for testing, make sure cache length and response totals match
        // console.log(dealsCache.length, response.total)
    
        return dealsCache
       
    } catch(e) {
        console.log(e)
    }
}

// getDeals();

//get contacts from deals

//function to loop with 
async function getContact(i){
    //get first deal from dealscache
    let dealsCache = await getDeals()
    let testDealId = dealsCache[i].hs_object_id
    
    //use dealscache hs_id to get associated contacts
    axios.get(`https://api.hubapi.com/crm/v4/objects/deal/${testDealId}/associations/contact`, {
        headers: {
            'Authorization': `Bearer ${process.env.APIKEY}`
        }
    }
    ).then(response => {
        let associations = response.data
        let contactId = associations.results[0].toObjectId
        
        let params = {
            properties: 'industry', 
        }

        //use id from association to find client
        axios.get(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
        params,    
        headers: {
            Authorization: `Bearer ${process.env.APIKEY}`,
            'Content-Type': 'application/json'
        }
    }).then(response => {

        let contact = response.data

        //update deal in cache with industry prop
        dealsCache[i]['industry'] = contact.properties.industry
        console.log(dealsCache[i])
    }).catch(error => {
        console.log(error)
    })
    }).catch(error => {
        console.log(error)
    });
    
    //get industry from contacts
    //add industry property to deal
}

// getContact(3)






async function updateDealsCache(){
    let dealsCache = await getDeals();

    for(let i=0; i < dealsCache.length; i++){
        let dealId = Number(dealsCache[i].hs_object_id);

        axios.get(`https://api.hubapi.com/crm/v4/objects/deal/${dealId}/associations/contact`, {
            headers: {
                'Authorization': `Bearer ${process.env.APIKEY}`
            }
        }
        ).then(response => {
            let associations = response.data
            let contactId = associations.results[0].toObjectId;

        
            let params = {
                properties: 'industry', 
            }

            //   use id from association to find client
            axios.get(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
            params,    
            headers: {
                Authorization: `Bearer ${process.env.APIKEY}`,
                'Content-Type': 'application/json'
            }
        }).then(response => {
    
            let contact = response.data
            console.log(contact)
            // update deal in cache with industry prop
            dealsCache[i]['industry'] = contact.properties.industry
            return dealsCache[i];
        }).catch(error => {
            console.log(error)
        })
    
        }).catch(error => {
            console.log(error)
        });
    }

   
    console.log(dealsCache) 
}





async function getAverageDealAmount(){
    let deals = await getDeals();
    let amounts = deals.map(deal => Number(deal.amount));
    let total = amounts.reduce((a,b) => a+b);
    let averageAmount = Math.floor(total / amounts.length)

    return averageAmount;
}



async function getAverageDays(req,res){
    let deals = await getDeals()
    let ranges = deals.map(deal => {
        return deal = new Date(deal.createdate).getTime() - new Date(deal.closedate).getTime()
    })

    rangeDifferences = ranges.map(deal => deal = Math.round(deal / (1000 * 60 * 60 * 24)))

    let daySumTotal = rangeDifferences.reduce((a,b) => a+b, 0)
    let averageDays = Math.floor(daySumTotal / ranges.length)

    return averageDays
}

getAverageDays();

(async () => {
    const users = await getAverageDays()
    return users
  })()


//return results in table
// console.table()

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
})




server.listen(PORT, hostname, () => {
    console.log(`Server running at http://${hostname}:${PORT}/`);
    
})