Ledger:
- Think about a ledger as a data model, it can hold any type/shape of data.
- any user that inputs in the ledger has to respect the data model
- the data of the ledger can be set to private or public

Transaction:
- When a user inputs data in the correct format in the ledger, it is recorded as a transaction
- the data is stored with its ledger id and the user info
- aside storage, the transaction can trigger some follow up actions:
    - confirmation email
    - trigger another transaction
    - redirect_uri
    - trigger on another app
- Transaction input types:
    - form input
    - url input
        - full input via url
        - partial input - full input via form submit
- Gamification: Transaction can generate points/tokens
- but we should record the fact that we send a link to fill a transaction?? keep history of completion rate etc..

Views:
- Ledger
    - Admmin view of the ledger that allows CRUD actions
    - Options/config for the ledger
    - Creation
    - List view
- Transactions
    - Basic Ag-grid
    - Interactive view
        - Map view : view the transactions by location
        - Townhall view : people enter a virtual room
        - Stream view: like an ag grid but allows interaction with the input of others (Like, comment, things like that)
        - sheet/excel view


Use Cases:
- Simple surveys on which we can track historical data vs leveraging other tools
- Take quick input (yes/no) / participation
- Redirect measurements: track when people click on url
- Quiz
- Games via email or form format
- Store events that are not captured in any system (reconciliation results, controls)
- Data enrichment
- Static data hosting
- Accounability: generate some acknowledgement email/Record decisions
- simple thanks tool in signature
- idea box

Question for after - can we leverage it as a budgetary tool?
- create a ledger form for budget input 
- interaction between ledgers
- formulas mgt
