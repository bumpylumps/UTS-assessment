# Install 
To install this app, pull down the repo from https://github.com/bumpylumps/UTS-assessment + npm install


## Tech used:
    - NodeJs
    - Hubspot client API
	- Axios


## Main Functions
- getDeals()
- getAverageAmounts()
- getAssociatedContacts()
- getAverageDates()


## Summary 

Here is my assessment for Unlimited Tech Solutions. Given the time constraint, I didn't get as far as I would like, but given more time would be able to make this a bit prettier and fully functional. It consumes the hubspotAPI to retrieve deals to meet the is_closed_won criteria ( **getDeals** ), and filters them to less than 365 days ago. There is also an averaging function ( **getAverageAmounts** ), a function to retrieve clients from deals based off of association records ( **getAssociatedContacts** ), and a final function to calculate ranges between deals ( **getAverageDates** ). Given more time, I would optimize some of the logic (especially in the getAssociatedContacts function) and make it work better. 

I had the most trouble with the getAssociatedContacts function, as I couldn't get the clients associated to each deal to return an industry other than null. But had I been able to, the idea was: 
 1) Loop through the deals cache I accrued
 2) Use each deals hs_object_id to make a call to the associations route (deal, client associations) and extract the relevant client Id's
 3) Use those client Id's to make a call to the clients search route and extract their industry properties
 4) Take those industry properties and append them to each relevant deal in the deals cache

After updating each deal in the deals cache with an industry, I would have then looped through that cache again to populate an object for each industry and store them in an array: 
eg. { 
	industry name: ${industry},
	average amounts : xxx
	average days: xxx 
 }

 That array would then be used to populate a console.table() to display the proper results.

 Despite getting stuck on that crucial part, I really enjoyed the challenge that this assessment provided. It was great to brush up on my axios skills and jump into the learning curve of the Hubspot API. It was also interesting figuring out how to access promises, and had I started a new project like this I would have started out by storing the deals cache as a solid object rather than rely on api calls to get them each time. 

 If there is time for feedback I would absolutely love to talk through the code with someone as I'm curious about different approaches to the problems that getAssociatedContacts() presents. It's not often that I try something crazy like an async request with multiple calls and I'm most likely going to be brainstorming alternatives for a while. Thank you to everyone at UTS who sat down with me in those interviews, and thank you for taking the time to check this project out.




# Notes 
## Goals: 
	- Get deals and contacts from Hubspot Contact and Deal APIs
	- Calculate: 
		- Avg time to close a deal 
		- Avg deal amount
	- Organize info as table as per example (console.table)


## API ref:
	- callsign: https://api.hubapi.com/ + 
		- crm/v3/objects/contacts 
		- crm/v3/objects/deals

## Pseudo:
1)  create application, install deps:
		1) hubspot api client
		2) node deps
		3) axios (if needed)
2)   get list of deals, filter by hs_is_closed_won = true, closeDate <= 365 days - axios or api client from hubspot
3) organize data: 
	1) organize list by contact industry
	2) get average number of days on deals (deal - startDate, closeDate)+ save
	3) get average number of totals on deals + save
4) return data as table: 
	1) see example
5) check code, comment, document 


Average for days: 
closedate - createdate = range

total days / range = avg 



## Getting deals

check for paging.next.after, update after value in request w/ limit value

For query responses:
	- check response page property to see if there's more data
	- can be recursive, probably easier as recursive
	- use paging.next.after 

## Getting associations: 

- look at associating records w/ a label section in association docs for toObjectType definitions
- url: /crm/v4/associations/{fromObjectType}/{toObjectType}/labels
- example: /crm/v4/associations/