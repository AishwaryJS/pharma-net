const express = require('express');
const app = express();
const cors = require('cors');
const port = 4000;

// Import all function modules

const addToWallet = require('./1_addToWallet');
const registerCompany = require('./2_registerCompany');
const addDrug = require('./3_addDrug');
const createPurchaseOrder = require('./4_createPurchaseOrder');
const createShipment = require('./5_createShipment');
const updateShipment = require('./6_updateShipment');
const retailDrug = require('./7_retailDrug');
const viewHistory = require('./8_viewHistory');
const viewDrugCurrentState = require('./9_viewDrugCurrentState');


// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Pharma Supply Chain App');

app.get('/', (req, res) => res.send('Hello User'));

app.post('/addToWallet', (req, res) => {
    addToWallet.execute(req.body.certificatePath, req.body.privateKeyPath,req.body.organization).then (() => {
        console.log('User Credentials added to wallet');
        const result = {
            status: 'success',
            message: 'User credentials added to wallet'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/registerCompany', (req, res) => {
    registerCompany.execute(req.body.companyCRN, req.body.companyName, req.body.location, req.body.organizationRole).then ((data) => {
        console.log('Register company request submitted on the Network');
        const result = {
            data : data,
            status: 'success',
            message: 'Register company request submitted on the Network'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});


app.post('/addDrug', async (req, res) => {
    addDrug.execute(req.body.drugName, req.body.serialNo, req.body.mfgDate, req.body.expDate, req.body.companyCRN, req.body.organizationRole).then ((data) => {
        console.log('Add drug request submitted on the Network');
        const result = {
            data : data,
            status: 'success',
            message: 'Add drug request submitted on the Network'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});


app.post('/createPurchaseOrder', (req, res) => {
    createPurchaseOrder.execute(req.body.buyerCRN, req.body.sellerCRN, req.body.drugName, req.body.quantity, req.body.organizationRole).then ((data) => {
        console.log('Create purchase order request submitted on the Network');
        const result = {
            data: data,
            status: 'success',
            message: 'Create purchase order request submitted on the Network'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/createShipment', (req, res) => {
    createShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.listOfAssets, req.body.transporterCRN, req.body.organizationRole).then ((data) => {
        console.log('Create shipment request submitted on the Network');
        const result = {
            data : data,
            status: 'success',
            message: 'Create shipment request submitted on the Network'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/updateShipment', (req, res) => {
    updateShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.transporterCRN, req.body.organizationRole).then ((data) => {
        console.log('Update shipment request submitted on the Network');
        const result = {
            data : data,
            status: 'success',
            message: 'Update shipment request submitted on the Network'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/retailDrug', (req, res) => {
    retailDrug.execute(req.body.drugName, req.body.serialNo, req.body.retailerCRN, req.body.customerAadhar, req.body.organizationRole).then ((data) => {
        console.log('Retail drug request submitted on the Network');
        const result = {
            data : data,
            status: 'success',
            message: 'Retail Drug request submitted on the Network'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/viewHistory', (req, res) => {
    viewHistory.execute(req.body.drugName, req.body.serialNo, req.body.organizationRole).then ((data) => {
        console.log('View drug history request submitted on the Network');
        const result = {
            data: data,
            status: 'success',
            message: 'View drug history request submitted on the Network'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/viewDrugCurrentState', (req, res) => {
    viewDrugCurrentState.execute(req.body.drugName, req.body.serialNo, req.body.organizationRole).then ((data) => {
        console.log('View drug request submitted on the Network');
        const result = {
            data: data,
            status: 'success',
            message: 'View drug request submitted on the Network'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.listen(port, () => console.log(`Distributed Pharma App listening on port ${port}!`));
