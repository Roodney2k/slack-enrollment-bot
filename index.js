const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Slack OAuth Credentials
const { SLACK_BOT_TOKEN } = process.env;

// In-memory store for enroller requests (replace with a database in production)
const requestStore = {};

// --- HELPER DATA FOR DROPDOWNS ---
const states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
const carriers = ["AETNA", "ALLWELL", "ANTHEM", "AMERIGROUP", "AMERIVANTAGE", "ASCENSION", "CAREPLUS", "CIGNA", "EMPIRE", "FIDELIS", "HUMANA", "HEALTHY BLUE", "HEALTHNET", "DEVOTED", "SIMPLY HEALTH", "UNITED HEALTHCARE", "WELLCARE", "WELLPOINT", "ZING", "SCAN", "CLOVER", "ALIGNMENT", "HEALTHSUN", "IMPERIAL", "MOLINA"];
const sepOptions = ["IEP", "IEP2", "ICEP", "LEC", "NLS", "MCD", "MOV", "OEP", "OEP-N", "SNP", "CDC", "CSNP", "INT", "DIF", "DST", "LTC", "MYT", "LCC", "PAP", "RUS", "LAW", "ACC", "AEP"];
// Default personnel list – override at runtime by setting the PERSONNEL_LIST
// environment variable to a comma-separated list of names (e.g. on Render).
const defaultPersonnel = ["ADAM RODRIGUES", "ADAM SCOGGINS", "ADRIANA ARROYAVE", "ALEXANDER DEFALCO", "AMIN HUSSEIN", "ANDRE AMORIM", "ARMAND SEGU", "ARMANIE GREGOIRE", "ARTEMISA CARVALHO", "ASHLEY FRAZIER", "BENNY BENJARARA", "BETHANY RAMIREZ", "BILLY HODGE", "CARL CAMPBELL", "CEDE VERGARA", "COURTNEY GARBATOW", "DAVID JARDINE", "DAWN ADILI", "ELIJAH CEBALLOS", "ERIC MENDEZ", "GABE VIERA", "GEORGE GUENTHER", "GIGI BASDEO", "GWEN LUSARDI", "INIKIA RAWLINSON", "JACLYN LAVERY", "JAMES MEYER", "JASON BLUM", "JAVEN SALCEDO", "JAVIER VALENCIA", "JEREMY BLOOD", "JEREMY MONELL", "JEREMY RAMOS", "JOHN STAMPOLIS", "JON GONZALES", "JONATHAN AARON", "JOSE RODRIGUEZ", "JOSEPH DEFALCO", "KIM O'CONNELL", "KIMBERLY BUCHANAN", "KRISTOF RAMSOOK", "LAURA DREMEL", "LAUREN WILLIAMS", "LEAH DOUGLAS", "LOUIS MARQUEZ", "MARCELA RIVERA", "MARIA PIANTANIDA", "MICHAEL FLAXMAN", "MITCH LIPPMAN", "NATHALY COGLE", "NEIL GOLDBERG", "NICK FORDE", "NICK GONZALES", "NICOLE DA SILVA", "NORMA TITCOMB", "OLGA GRAJALES", "OMAR GARCIA", "PAIGHTON PYATT", "PAOLA ALMANAZAR", "RAQUEL MCCRAY", "RICHARD REY", "RONALD DIAZ", "SABRINA GONZALEZ", "SHEREEN ADILI", "SHNAY RICHARDSON","TAYLOR DUNCAN", "TERENCE PHILLIPS", "TIFFANY COOK", "TJ HEPBURN", "WENDY CORONA", "YARISSA FERNANDEZ", "PHIL COOK", "SARAH SANZ", "STEPHANIE WALTON", "JAMIE GINBERG", "OSCAR VALIDO", "MARCO SECOLO", "JAIME LOPA", "CRISTINA RODRIGUEZ", "JUAN MONTENEGRO", "AIDAN DECAMILLO", "KEVIN OLIVER", "DANIEL GREENSTEIN", "RHONESIA WHITE", "KEVIN YOUNG", "MARA BLOOM", "LADEJA NEVLOUS", "CHARLES MOORE", "TRANESE BUTLER", "LINDA ROBINSON", "ALEX SQUITIERI", "JEFF WARSHAW", "JOSHUA GERIBON", "SETH BOBKER", "ESSENCE GONZALEZ", "JOSHUA PEAN", "RANDY NUNEZ", "SOBNER ANILUS", "PATRICK CONLON", "MADISON RUGGIERI", "CHRIS CANNONE", "OWAIS AHMED", "BRANDON YOUNGBLOOD", "EMMANUEL MELGAR", "DANNY SHORE", "TYLER CAMPANELLA", "MATT FASS", "KEANU KNOWLES", "MARVIN DOMINIQUE", "JADON ROZEN", "ANGELICA MENDOZA", "JAHNEEN KING", "BARBARA DOLAN", "BEVERLY ARMSTRONG", "HUNTER STITH", "CHARLES MOORE", "CARL CAMPBELL", "DARRELL KENDRICK", "DARRIAN ROBERSON", "LAURA DREMEL", "MALISHA RIDER", "SUELLEN MONROIG", "MIRLA URDANETA", "DAN SHEYNIN", "RAY HERNANDEZ", "JASPER WALKER", "KRISTEN KILGORE", "MELANIE MERRITT", "JANE DAVIS", "MARJORIE LONG", "MEGAN KEETON", "GIOVANNI SACASA", "TONI BRATCHER", "SETH LICHTER", "YADIRA BENAVIDES", "YARITZA SANCHEZ", "ANEIDA SAAVEDRA", "LUISA TENORIO", "MONIKA LEGISA DE GABACHE", "BARBARA BUCKNER", "IVETTE JIMENEZ", "DANIA CHAVARRI", "ARMANDO LUNA BRAVO", "ADRIANA DAWSON", "JAIDEN BOCK", "BARBARA BUCKNER", "MARIA MONTALVO", "MORELBA PLATT", "ANJELICA SCOTT", "BRITTANY EVANS", "ELIZABETH JOHNSON", "JESSICA GERIBON", "QUOYASTINE MOORE", "MICHELE IANNELLI", "ALEXANDER SHAPIRO", "DURJIANI YOUNG", "CHRISTALEE GARCIA", "LAKEISHA GOOLSBY", "SCHNAIDER SERVIUS", "HENRY COLL", "ANA MONGE", "JAYSA CARBALLO", "MARIA CASTILLO", "CLIFF MYRTIL", "LC CAPOLINO", "FERNANDO PETROCELLI", "JARED BAIJNAUTH", "MANNY JOHNSON", "NICOLE LEWY", "ARTIE SIEGLE", "BRANDON BELL", "DANILL ELIMELAKH", "JACQUELINE ECCLESTON", "MARK SNYDER", "SEARN ARBEARY", "SHEMARA BARRETT","ANANY HIDALGO"];
const personnel = process.env.PERSONNEL_LIST
    ? process.env.PERSONNEL_LIST.split(',').map(n => n.trim()).filter(Boolean)
    : defaultPersonnel;
const languages = ["ENGLISH", "SPANISH"];
const indemnityPlanTypes = ["HOSPITAL INDEMNITY SHIELD", "GUARANTEED ISSUE HOSPITAL INDEMNITY SHIELD", "HOME HEALTHCARE SHIELD", "DENTAL SHIELD 2.0", "CANCER SHIELD 2.0", "FINAL EXPENSE SHIELD", "CAREGIVER SHIELD"];

function buildIndemnityBlocks(addOnType) {
    // addOnType: null | 'second_plan' | 'dental' | 'spouse'
    const addOnOptions = [
        { text: { type: 'plain_text', text: 'None' }, value: 'none' },
        { text: { type: 'plain_text', text: 'Second Plan' }, value: 'second_plan' },
        { text: { type: 'plain_text', text: 'Dental' }, value: 'dental' },
        { text: { type: 'plain_text', text: 'Add Spouse' }, value: 'spouse' },
    ];
    const addOnSelectElement = {
        type: 'static_select',
        action_id: 'ind_add_on_select',
        placeholder: { type: 'plain_text', text: 'Add additional plan (optional)' },
        options: addOnOptions,
    };
    if (addOnType && addOnType !== 'none') {
        addOnSelectElement.initial_option = addOnOptions.find(o => o.value === addOnType);
    }

    const blocks = [
        { type: 'input', block_id: 'ind_first_name_block', label: { type: 'plain_text', text: 'FIRST NAME' }, element: { type: 'plain_text_input', action_id: 'ind_first_name' } },
        { type: 'input', block_id: 'ind_last_name_block', label: { type: 'plain_text', text: 'LAST NAME' }, element: { type: 'plain_text_input', action_id: 'ind_last_name' } },
        { type: 'input', block_id: 'ind_dob_block', label: { type: 'plain_text', text: 'DATE OF BIRTH' }, element: { type: 'datepicker', action_id: 'ind_dob' } },
        { type: 'input', block_id: 'ind_phone_block', label: { type: 'plain_text', text: 'PHONE NUMBER' }, element: { type: 'plain_text_input', action_id: 'ind_phone', placeholder: { type: 'plain_text', text: '1234567890 (10 digits, no dashes)' } } },
        { type: 'input', block_id: 'ind_state_block', label: { type: 'plain_text', text: 'STATE' }, element: { type: 'static_select', action_id: 'ind_state', placeholder: { type: 'plain_text', text: 'Select a state' }, options: createSlackOptions(states) } },
        { type: 'input', block_id: 'ind_plan_type_block', label: { type: 'plain_text', text: 'TYPE OF PLAN' }, element: { type: 'static_select', action_id: 'ind_plan_type', placeholder: { type: 'plain_text', text: 'Select a plan type' }, options: createSlackOptions(indemnityPlanTypes) } },
        { type: 'input', block_id: 'ind_premium_block', label: { type: 'plain_text', text: 'PREMIUM AMOUNT' }, element: { type: 'plain_text_input', action_id: 'ind_premium', placeholder: { type: 'plain_text', text: 'e.g. 49.99 (numbers only, no $)' } } },
        { type: 'input', block_id: 'ind_policy_number_block', label: { type: 'plain_text', text: 'POLICY NUMBER' }, element: { type: 'plain_text_input', action_id: 'ind_policy_number' } },
        { type: 'input', block_id: 'ind_effective_date_block', label: { type: 'plain_text', text: 'PLAN EFFECTIVE DATE' }, element: { type: 'datepicker', action_id: 'ind_effective_date' } },
        { type: 'input', block_id: 'ind_draft_date_block', label: { type: 'plain_text', text: 'PREMIUM DRAFT DATE' }, element: { type: 'datepicker', action_id: 'ind_draft_date' } },
        { type: 'input', block_id: 'ind_medicaid_block', label: { type: 'plain_text', text: 'DID CUSTOMER HAVE MEDICAID?' }, element: { type: 'static_select', action_id: 'ind_medicaid', placeholder: { type: 'plain_text', text: 'Select Yes or No' }, options: createSlackOptions(['YES', 'NO']) } },
        { type: 'input', block_id: 'ind_agent_block', label: { type: 'plain_text', text: 'AGENT NAME' }, element: { type: 'external_select', action_id: 'ind_agent', placeholder: { type: 'plain_text', text: 'Type to search...' }, min_query_length: 1 } },
        { type: 'input', block_id: 'ind_language_block', label: { type: 'plain_text', text: 'LANGUAGE' }, element: { type: 'static_select', action_id: 'ind_language', placeholder: { type: 'plain_text', text: 'Select a language' }, options: createSlackOptions(languages) } },
        { type: 'actions', block_id: 'ind_add_on_block', elements: [addOnSelectElement] }
    ];

    if (addOnType === 'second_plan' || addOnType === 'dental') {
        blocks.push(
            { type: 'input', block_id: 'ind_second_plan_type_block', label: { type: 'plain_text', text: 'SECOND PLAN - TYPE OF PLAN' }, element: { type: 'static_select', action_id: 'ind_second_plan_type', placeholder: { type: 'plain_text', text: 'Select a plan type' }, options: createSlackOptions(indemnityPlanTypes) } },
            { type: 'input', block_id: 'ind_second_premium_block', label: { type: 'plain_text', text: 'SECOND PLAN - PREMIUM AMOUNT' }, element: { type: 'plain_text_input', action_id: 'ind_second_premium', placeholder: { type: 'plain_text', text: 'e.g. 29.99 (numbers only, no $)' } } }
        );
    } else if (addOnType === 'spouse') {
        blocks.push(
            { type: 'input', block_id: 'ind_spouse_first_name_block', label: { type: 'plain_text', text: 'SPOUSE FIRST NAME' }, element: { type: 'plain_text_input', action_id: 'ind_spouse_first_name' } },
            { type: 'input', block_id: 'ind_spouse_last_name_block', label: { type: 'plain_text', text: 'SPOUSE LAST NAME' }, element: { type: 'plain_text_input', action_id: 'ind_spouse_last_name' } },
            { type: 'input', block_id: 'ind_spouse_policy_number_block', label: { type: 'plain_text', text: 'SPOUSE POLICY NUMBER' }, element: { type: 'plain_text_input', action_id: 'ind_spouse_policy_number' } },
            { type: 'input', block_id: 'ind_spouse_premium_block', label: { type: 'plain_text', text: 'SPOUSE PREMIUM AMOUNT' }, element: { type: 'plain_text_input', action_id: 'ind_spouse_premium', placeholder: { type: 'plain_text', text: 'e.g. 49.99 (numbers only, no $)' } } }
        );
    }

    return blocks;
}

// Helper function to create Slack options from an array
const createSlackOptions = (optionsArray) => {
    return optionsArray.map(option => ({
        text: { type: 'plain_text', text: option, emoji: true },
        value: option
    }));
};

// Route for handling Slack commands
app.post('/webhook/slack/command', async (req, res) => {
    const { command, trigger_id } = req.body;
    console.log(`Received command: ${command}`);
if (command === '/your-command-name') {
    let modal_title = '';
    let blocks = [];
    let callbackId = '';

    if (command === '/mbi') {
        modal_title = 'MBI Lookup';
        blocks = [
            { type: 'section', text: { type: 'mrkdwn', text: 'Please fill in the details for MBI Lookup' } },
            { type: 'input', block_id: 'input-first-name', label: { type: 'plain_text', text: 'First Name' }, element: { type: 'plain_text_input', action_id: 'first_name' } },
            { type: 'input', block_id: 'input-last-name', label: { type: 'plain_text', text: 'Last Name' }, element: { type: 'plain_text_input', action_id: 'last_name' } },
            { type: 'input', block_id: 'input-ssn', label: { type: 'plain_text', text: 'SSN (Optional)' }, element: { type: 'plain_text_input', action_id: 'ssn' }, optional: true },
            { type: 'input', block_id: 'input-mbi-number', label: { type: 'plain_text', text: 'MBI Number' }, element: { type: 'plain_text_input', action_id: 'mbi_number' } },
            { type: 'input', block_id: 'input-dob', label: { type: 'plain_text', text: 'Date of Birth (MM/DD/YYYY)' }, element: { type: 'plain_text_input', action_id: 'dob', placeholder: { type: 'plain_text', text: 'MM/DD/YYYY' } } },
        ];
        callbackId = 'mbi_modal';
    } else if (command === '/medicaid') {
        modal_title = 'Medicaid Check';
        blocks = [
            { type: 'section', text: { type: 'mrkdwn', text: 'Please fill in the details for Medicaid Check' } },
            { type: 'input', block_id: 'input-carrier', label: { type: 'plain_text', text: 'Carrier' }, element: { type: 'static_select', action_id: 'carrier', options: createSlackOptions(["Aetna", "Anthem", "Humana", "United Healthcare"]) } },
            { type: 'input', block_id: 'input-first-name', label: { type: 'plain_text', text: 'First Name' }, element: { type: 'plain_text_input', action_id: 'first_name' } },
            { type: 'input', block_id: 'input-last-name', label: { type: 'plain_text', text: 'Last Name' }, element: { type: 'plain_text_input', action_id: 'last_name' } },
            { type: 'input', block_id: 'input-zip', label: { type: 'plain_text', text: 'ZIP Code' }, element: { type: 'plain_text_input', action_id: 'zip' } },
            { type: 'input', block_id: 'input-county', label: { type: 'plain_text', text: 'County' }, element: { type: 'plain_text_input', action_id: 'county' } },
            { type: 'input', block_id: 'input-state', label: { type: 'plain_text', text: 'State' }, element: { type: 'plain_text_input', action_id: 'state' } },
            { type: 'input', block_id: 'input-gender', label: { type: 'plain_text', text: 'Gender' }, element: { type: 'static_select', action_id: 'gender', options: createSlackOptions(["Male", "Female", "Other"]) } },
            { type: 'input', block_id: 'input-dob', label: { type: 'plain_text', text: 'Date of Birth (MM/DD/YYYY)' }, element: { type: 'plain_text_input', action_id: 'dob', placeholder: { type: 'plain_text', text: 'MM/DD/YYYY' } } },
            { type: 'input', block_id: 'input-mbi-number', label: { type: 'plain_text', text: 'MBI Number (Optional)' }, element: { type: 'plain_text_input', action_id: 'mbi_number' }, optional: true },
            { type: 'input', block_id: 'input-ssn', label: { type: 'plain_text', text: 'SSN (Optional)' }, element: { type: 'plain_text_input', action_id: 'ssn' }, optional: true },
        ];
        callbackId = 'medicaid_modal';
    } else if (command === '/enroller') {
        modal_title = 'Enroller Request';
        blocks = [
            { type: 'section', text: { type: 'mrkdwn', text: 'Please fill in the details for Enroller Request' } },
            { type: 'input', block_id: 'input-sunfire-code', label: { type: 'plain_text', text: 'Sunfire Code (Optional)' }, element: { type: 'plain_text_input', action_id: 'sunfire_code' }, optional: true },
            { type: 'input', block_id: 'input-mbi-number', label: { type: 'plain_text', text: 'Medicare (MBI) Number' }, element: { type: 'plain_text_input', action_id: 'mbi_number' } },
            { type: 'input', block_id: 'input-client-name', label: { type: 'plain_text', text: 'Client Name' }, element: { type: 'plain_text_input', action_id: 'client_name' } },
            { type: 'input', block_id: 'input-state', label: { type: 'plain_text', text: 'State' }, element: { type: 'plain_text_input', action_id: 'state' } },
            { type: 'input', block_id: 'input-zip', label: { type: 'plain_text', text: 'ZIP Code' }, element: { type: 'plain_text_input', action_id: 'zip' } },
            { type: 'input', block_id: 'input-current-plan', label: { type: 'plain_text', text: 'Current Plan Name/Code' }, element: { type: 'plain_text_input', action_id: 'current_plan' } },
            { type: 'input', block_id: 'input-carrier', label: { type: 'plain_text', text: 'Carrier' }, element: { type: 'plain_text_input', action_id: 'carrier' } },
        ];
        callbackId = 'enroller_modal';
    } else if (command === '/deal') {
        modal_title = 'Submit New Enrollment';
        const today = new Date().toISOString().split('T')[0];
        blocks = [
            { type: 'section', text: { type: 'mrkdwn', text: 'Please fill in the enrollment details to submit to HubSpot.' } },
            { type: 'input', block_id: 'customer_first_name_block', label: { type: 'plain_text', text: 'CUSTOMER FIRST NAME' }, element: { type: 'plain_text_input', action_id: 'customer_first_name' } },
            { type: 'input', block_id: 'customer_last_name_block', label: { type: 'plain_text', text: 'CUSTOMER LAST NAME' }, element: { type: 'plain_text_input', action_id: 'customer_last_name' } },
            { type: 'input', block_id: 'phone_number_block', label: { type: 'plain_text', text: 'PHONE NUMBER' }, element: { type: 'plain_text_input', action_id: 'phone_number', placeholder: {type: 'plain_text', text: '10 digits only' } } },
            { type: 'input', block_id: 'date_of_birth_block', label: { type: 'plain_text', text: 'DATE OF BIRTH' }, element: { type: 'datepicker', action_id: 'date_of_birth' } },
            { type: 'input', block_id: 'mbi_number_block', label: { type: 'plain_text', text: 'MBI NUMBER' }, element: { type: 'plain_text_input', action_id: 'mbi_number' } },
            { type: 'input', block_id: 'address_block', label: { type: 'plain_text', text: 'ADDRESS' }, element: { type: 'plain_text_input', action_id: 'address' } },
            { type: 'input', block_id: 'city_block', label: { type: 'plain_text', text: 'CITY' }, element: { type: 'plain_text_input', action_id: 'city' } },
            { type: 'input', block_id: 'state_block', label: { type: 'plain_text', text: 'STATE' }, element: { type: 'static_select', action_id: 'state', options: createSlackOptions(states) } },
            { type: 'input', block_id: 'zip_code_block', label: { type: 'plain_text', text: 'ZIP CODE' }, element: { type: 'plain_text_input', action_id: 'zip_code', placeholder: {type: 'plain_text', text: '5 digits only' } } },
            { type: 'input', block_id: 'carrier_block', label: { type: 'plain_text', text: 'CARRIER' }, element: { type: 'static_select', action_id: 'carrier', options: createSlackOptions(carriers) } },
            { type: 'input', block_id: 'plan_name_block', label: { type: 'plain_text', text: 'PLAN NAME (WITH CODE)' }, element: { type: 'plain_text_input', action_id: 'plan_name_with_code' } },
            { type: 'input', block_id: 'sep_used_block', label: { type: 'plain_text', text: 'SEP USED' }, element: { type: 'static_select', action_id: 'sep_used', options: createSlackOptions(sepOptions) } },
            { type: 'input', block_id: 'closer_block', label: { type: 'plain_text', text: 'CLOSER' }, element: { type: 'external_select', action_id: 'closer', placeholder: { type: 'plain_text', text: 'Type to search for a closer' }, min_query_length: 1 } },
            { type: 'input', block_id: 'enroller_block', label: { type: 'plain_text', text: 'ENROLLER' }, element: { type: 'external_select', action_id: 'enroller', placeholder: { type: 'plain_text', text: 'Type to search for an enroller' }, min_query_length: 1 } },
            { type: 'input', block_id: 'language_block', label: { type: 'plain_text', text: 'LANGUAGE' }, element: { type: 'static_select', action_id: 'language', options: createSlackOptions(languages) } },
            { type: 'input', block_id: 'date_submitted_block', label: { type: 'plain_text', text: 'DATE SUBMITTED' }, element: { type: 'datepicker', action_id: 'date_submitted', initial_date: today } }
        ];
        callbackId = 'daily_deal_modal';
    } else if (command === '/indemnity') {
        modal_title = 'Indemnity Deal';
        blocks = buildIndemnityBlocks(false);
        callbackId = 'indemnity_deal_modal';
    } else {
         console.warn(`Received unknown command: ${command}`);
         return res.status(200).send(`Sorry, the command "${command}" is not recognized.`);
    }

    const modalView = {
        trigger_id,
        view: {
            type: 'modal',
            callback_id: callbackId,
            title: { type: 'plain_text', text: modal_title, emoji: true },
            blocks: blocks,
            close: { type: 'plain_text', text: 'Cancel', emoji: true },
            submit: { type: 'plain_text', text: 'Submit', emoji: true },
        },
    };

    try {
        await axios.post('https://slack.com/api/views.open', modalView, {
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SLACK_BOT_TOKEN}` },
        });
        res.status(200).send();
    } catch (error) {
        console.error('Error opening modal:', error.response?.data || error.message);
        res.status(200).send(`:x: Failed to open modal: ${error.response?.data?.error || 'Unknown error'}`);
    }
});

// Route for handling interactive components (submissions, button clicks)
app.post('/webhook/slack/interactive', async (req, res) => {
    let payload;
    try {
        payload = JSON.parse(req.body.payload);
    } catch (e) {
        console.error("Error parsing interactive payload:", e);
        return res.status(400).send("Invalid payload.");
    }

    const { type, view, user, message, channel, actions } = payload;

    if (type === 'view_submission') {
        const { callback_id } = view;
        const values = extractDataFromState(view.state.values);
        const submitterUser = user.id;

        // Validate premium fields before acknowledging
        if (callback_id === 'indemnity_deal_modal') {
            const errors = {};
            if (values.ind_premium && !/^\d+(\.\d{1,2})?$/.test(values.ind_premium)) {
                errors['ind_premium_block'] = 'Numbers only, no $ or special characters (e.g. 49.99)';
            }
            if (values.ind_second_premium && !/^\d+(\.\d{1,2})?$/.test(values.ind_second_premium)) {
                errors['ind_second_premium_block'] = 'Numbers only, no $ or special characters (e.g. 29.99)';
            }
            if (values.ind_spouse_premium && !/^\d+(\.\d{1,2})?$/.test(values.ind_spouse_premium)) {
                errors['ind_spouse_premium_block'] = 'Numbers only, no $ or special characters (e.g. 49.99)';
            }
            if (Object.keys(errors).length > 0) {
                return res.json({ response_action: 'errors', errors });
            }
        }

        res.send(); // Acknowledge immediately

        try {
            if (callback_id === 'mbi_modal' || callback_id === 'medicaid_modal') {
                const requestType = callback_id === 'mbi_modal' ? 'MBI' : 'Medicaid';
                const agentRequestChannelId = process.env.AGENT_REQUEST_CHANNEL_ID;
                if (!agentRequestChannelId) {
                    console.error(`Error: AGENT_REQUEST_CHANNEL_ID is not defined.`);
                    return await postSlackMessage(submitterUser, `:warning: Configuration error. Please contact an admin.`);
                }
                await postSlackMessage(submitterUser, `<@${submitterUser}>, Your ${requestType} request has been submitted!`);
                let backOfficeText = `*New ${requestType} Request from <@${submitterUser}>*\n\n`;
                for (const key in values) {
                    if (values[key]) {
                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        backOfficeText += `*${label}:* ${values[key]}\n`;
                    }
                }
                await axios.post('https://slack.com/api/chat.postMessage', {
                    channel: agentRequestChannelId,
                    text: `New ${requestType} request from <@${submitterUser}>`,
                    blocks: [
                        { type: 'section', text: { type: 'mrkdwn', text: backOfficeText } },
                        { type: 'actions', block_id: `accept_actions_${Date.now()}`, elements: [
                            { type: 'button', action_id: 'accept_mbi_medicaid', text: { type: 'plain_text', text: 'Accept Request' }, style: 'primary', value: JSON.stringify({ submitter: submitterUser, type: requestType, formData: values }) }
                        ]}
                    ]
                }, { headers: { 'Authorization': `Bearer ${SLACK_BOT_TOKEN}` } });
            } else if (callback_id === 'enroller_modal') {
                const enrollerChannelId = process.env.ENROLLER_CHANNEL_ID;
                if (!enrollerChannelId) {
                    console.error(`Error: ENROLLER_CHANNEL_ID is not defined.`);
                    return await postSlackMessage(submitterUser, `:warning: Configuration error. Please contact an admin.`);
                }
                await postSlackMessage(submitterUser, "THANKS FOR REQUESTING AN ENROLLER. Your request is being reviewed.");
                const partialText = `*New Enrollment Request by <@${submitterUser}>!*\n\n*Client Name:* ${values.client_name || 'N/A'}\n*State:* ${values.state || 'N/A'}\n*Carrier:* ${values.carrier || 'N/A'}\n\nClick REVIEW to see full details.`;
                const postResult = await axios.post('https://slack.com/api/chat.postMessage', {
                    channel: enrollerChannelId,
                    text: `Enrollment request by <@${submitterUser}>!`,
                    blocks: [
                        { type: 'section', text: { type: 'mrkdwn', text: partialText } },
                        { type: 'actions', block_id: `enroller_actions_${Date.now()}`, elements: [
                            { type: 'button', action_id: 'review_enroller', text: { type: 'plain_text', text: 'REVIEW' }, style: 'primary', value: JSON.stringify({ submitter: submitterUser }) }
                        ]}
                    ]
                }, { headers: { 'Authorization': `Bearer ${SLACK_BOT_TOKEN}` } });
                if (postResult.data.ok) {
                    requestStore[postResult.data.ts] = { fullData: values, submitterId: submitterUser };
                }
            } else if (callback_id === 'indemnity_deal_modal') {
                const indemnityChannelId = 'C0AFGCKA43Y';
                const indemnityZapierUrl = 'https://hooks.zapier.com/hooks/catch/15024077/uctwyi0/';

                // Determine add-on type from which conditional fields are present
                const hasSecondPlan = !!(values.ind_second_plan_type);
                const hasSpouse = !!(values.ind_spouse_first_name);

                const baseData = { ...values, submitted_by_slack_id: submitterUser };
                // Strip all add-on fields from the primary entry
                delete baseData.ind_second_plan_type;
                delete baseData.ind_second_premium;
                delete baseData.ind_spouse_first_name;
                delete baseData.ind_spouse_last_name;
                delete baseData.ind_spouse_policy_number;
                delete baseData.ind_spouse_premium;

                console.log('[INDEMNITY DEAL] Primary entry:', JSON.stringify(baseData, null, 2));

                try {
                    await axios.post(indemnityZapierUrl, baseData);
                    console.log(`[INDEMNITY DEAL] Successfully sent primary entry for user ${submitterUser}.`);

                    if (hasSecondPlan) {
                        const secondPlanData = { ...baseData, ind_plan_type: values.ind_second_plan_type, ind_premium: values.ind_second_premium };
                        console.log('[INDEMNITY DEAL] Second plan entry:', JSON.stringify(secondPlanData, null, 2));
                        await axios.post(indemnityZapierUrl, secondPlanData);
                        console.log(`[INDEMNITY DEAL] Successfully sent second plan entry for user ${submitterUser}.`);
                    } else if (hasSpouse) {
                        const spouseData = { ...baseData, ind_first_name: values.ind_spouse_first_name, ind_last_name: values.ind_spouse_last_name, ind_policy_number: values.ind_spouse_policy_number, ind_premium: values.ind_spouse_premium };
                        console.log('[INDEMNITY DEAL] Spouse entry:', JSON.stringify(spouseData, null, 2));
                        await axios.post(indemnityZapierUrl, spouseData);
                        console.log(`[INDEMNITY DEAL] Successfully sent spouse entry for user ${submitterUser}.`);
                    }

                    const confirmMsg = hasSecondPlan
                        ? 'Your indemnity deal (with second plan) has been submitted successfully!'
                        : hasSpouse
                            ? 'Your indemnity deal (with spouse) has been submitted successfully!'
                            : 'Your indemnity deal has been submitted successfully!';
                    await postSlackMessage(submitterUser, confirmMsg);

                    let notificationText = `*New Indemnity Deal Submitted by <@${submitterUser}>!*\n\n`;
                    for (const key in baseData) {
                        if (baseData[key] && key !== 'submitted_by_slack_id') {
                            const label = key.replace(/^ind_/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            notificationText += `*${label}:* ${baseData[key]}\n`;
                        }
                    }
                    if (hasSecondPlan) {
                        notificationText += `\n*--- Second Plan ---*\n*Plan Type:* ${values.ind_second_plan_type}\n*Premium Amount:* ${values.ind_second_premium}\n`;
                    } else if (hasSpouse) {
                        notificationText += `\n*--- Spouse ---*\n*Name:* ${values.ind_spouse_first_name} ${values.ind_spouse_last_name}\n*Policy Number:* ${values.ind_spouse_policy_number}\n*Premium Amount:* ${values.ind_spouse_premium}\n`;
                    }
                    await postSlackMessage(indemnityChannelId, notificationText);
                } catch (error) {
                    console.error('[INDEMNITY DEAL] Error sending data to Zapier:', error.response?.data || error.message);
                    await postSlackMessage(submitterUser, ':x: There was an error submitting your indemnity deal. Please contact an admin.');
                }
            } else if (callback_id === 'daily_deal_modal') {
                const zapierWebhookUrl = "https://hooks.zapier.com/hooks/catch/15024077/2n047ve/";
                console.log(`[DEAL SUBMISSION] Using hardcoded Zapier URL: ${zapierWebhookUrl}`);

                const submissionData = { ...values, submitted_by_slack_id: submitterUser };
                console.log("[DEAL SUBMISSION] Data to be sent:", JSON.stringify(submissionData, null, 2));

                try {
                    await axios.post(zapierWebhookUrl, submissionData);
                    console.log(`[DEAL SUBMISSION] Successfully sent data for user ${submitterUser}.`);
                    await postSlackMessage(submitterUser, "✅ Your enrollment has been successfully submitted to HubSpot! Thank you.");
                    
                    const dailyDealsChannelId = process.env.DAILY_DEALS_CHANNEL_ID;
                    if (dailyDealsChannelId) {
                        let notificationText = `🎉 *New Enrollment Submitted by <@${submitterUser}>!*\n\n`;
                        for (const key in values) {
                            if (values[key]) {
                                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                notificationText += `*${label}:* ${values[key]}\n`;
                            }
                        }
                        await postSlackMessage(dailyDealsChannelId, notificationText);
                    }
                } catch (error) {
                    console.error("[DEAL SUBMISSION] Error sending data to Zapier:", error.response?.data || error.message);
                    await postSlackMessage(submitterUser, `:x: There was an error submitting your enrollment. Please contact an admin.`);
                }
            }
        } catch (error) {
            console.error(`Error processing view_submission ${callback_id}:`, error);
            await postSlackMessage(submitterUser, `:warning: An error occurred after submission. Please contact support.`);
        }
    } else if (type === 'block_actions') {
        res.send(); // Acknowledge immediately
        const action = actions[0];
        const clickerUser = user.id;

        if (action.action_id === 'ind_add_on_select' && view) {
            const addOnType = action.selected_option?.value || null;
            try {
                await axios.post('https://slack.com/api/views.update', {
                    view_id: view.id,
                    hash: view.hash,
                    view: {
                        type: 'modal',
                        callback_id: 'indemnity_deal_modal',
                        title: { type: 'plain_text', text: 'Indemnity Deal', emoji: true },
                        blocks: buildIndemnityBlocks(addOnType),
                        close: { type: 'plain_text', text: 'Cancel', emoji: true },
                        submit: { type: 'plain_text', text: 'Submit', emoji: true },
                    }
                }, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SLACK_BOT_TOKEN}` } });
                console.log(`[INDEMNITY] Add-on selected: ${addOnType}`);
            } catch (error) {
                console.error('[INDEMNITY] Error updating modal:', error.response?.data || error.message);
            }
            return;
        }

        const sourceChannelId = channel?.id;
        const messageTs = message?.ts;
        try {
            if (action.action_id === 'accept_mbi_medicaid') {
                const { submitter, type, formData } = JSON.parse(action.value);
                await postSlackMessage(submitter, `Your ${type} request has been accepted by <@${clickerUser}>!`);
                let agentDetails = `*Details for ${type} Request (Submitted by <@${submitter}>)*:\n\n`;
                for (const key in formData) {
                    if (formData[key]) {
                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        agentDetails += `*${label}:* ${formData[key]}\n`;
                    }
                }
                await postSlackMessage(clickerUser, agentDetails);
                const updatedBlocks = message.blocks.filter(b => b.type !== 'actions');
                updatedBlocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `:white_check_mark: Accepted by <@${clickerUser}>` }] });
                await axios.post('https://slack.com/api/chat.update', { channel: sourceChannelId, ts: messageTs, blocks: updatedBlocks }, { headers: { 'Authorization': `Bearer ${SLACK_BOT_TOKEN}` } });
            } else if (action.action_id === 'review_enroller') {
                const { submitter } = JSON.parse(action.value);
                const storedRequest = requestStore[messageTs];
                if (!storedRequest) return console.error(`No stored data for ts: ${messageTs}`);
                let fullDetailsText = `*Full Enrollment Details (Request from <@${submitter}>)*:\n\n`;
                for (const key in storedRequest.fullData) {
                    if (storedRequest.fullData[key]) {
                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        fullDetailsText += `*${label}:* ${storedRequest.fullData[key]}\n`;
                    }
                }
                await axios.post('https://slack.com/api/chat.update', {
                    channel: sourceChannelId,
                    ts: messageTs,
                    blocks: [
                        { type: 'section', text: { type: 'mrkdwn', text: fullDetailsText } },
                        { type: 'actions', elements: [{ type: 'button', action_id: 'accept_enroller', text: { type: 'plain_text', text: 'ACCEPT ENROLLMENT' }, style: 'primary', value: JSON.stringify({ submitter, reviewer: clickerUser, messageTs }) }] },
                        { type: 'context', elements: [{ type: 'mrkdwn', text: `:eyes: Reviewed by <@${clickerUser}>` }] }
                    ]
                }, { headers: { 'Authorization': `Bearer ${SLACK_BOT_TOKEN}` } });
            } else if (action.action_id === 'accept_enroller') {
                const { submitter, messageTs: originalMessageTs } = JSON.parse(action.value);
                await postSlackMessage(submitter, `Your Enrollment Request has been accepted by <@${clickerUser}>.`);
                const finalBlocks = message.blocks.filter(b => b.type !== 'actions');
                finalBlocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `:white_check_mark: Enrollment Accepted by <@${clickerUser}>` }] });
                await axios.post('https://slack.com/api/chat.update', { channel: sourceChannelId, ts: originalMessageTs, blocks: finalBlocks }, { headers: { 'Authorization': `Bearer ${SLACK_BOT_TOKEN}` } });
                delete requestStore[originalMessageTs];
            }
        } catch (error) {
            console.error(`Error handling block_action ${action.action_id}:`, error);
        }
    } else {
        res.send();
    }
});

// Route for handling the searchable dropdown options
app.post('/webhook/slack/options', (req, res) => {
    // Slack sends the payload as application/x-www-form-urlencoded for this request type
    const payload = JSON.parse(req.body.payload);
    const keyword = payload.value.toLowerCase();
    
    // Filter the personnel list based on the user's typing
    const filteredPersonnel = personnel.filter(p => p.toLowerCase().includes(keyword));
    
    // Format the results for Slack and cap at 100
    const options = createSlackOptions(filteredPersonnel.slice(0, 100));
    
    res.status(200).json({ options });
});


// Helper function to extract data from modal state
function extractDataFromState(stateValues) {
    const data = {};
    if (!stateValues) return data;
    for (const blockId in stateValues) {
        const blockData = stateValues[blockId];
        for (const actionId in blockData) {
            const elementData = blockData[actionId];
            if (elementData.type === 'plain_text_input') {
                data[actionId] = elementData.value || '';
            } else if (elementData.type === 'static_select' || elementData.type === 'external_select') {
                data[actionId] = elementData.selected_option?.value;
            } else if (elementData.type === 'datepicker') {
                data[actionId] = elementData.selected_date;
            } else if (elementData.type === 'checkboxes') {
                data[actionId] = (elementData.selected_options || []).map(o => o.value).join(', ');
            }
        }
    }
    return data;
}

// Helper function for posting messages
async function postSlackMessage(channel, text, blocks = null) {
    if (!channel || !text) return console.error("postSlackMessage missing channel or text");
    try {
        await axios.post('https://slack.com/api/chat.postMessage', { channel, text, blocks }, {
            headers: { 'Authorization': `Bearer ${SLACK_BOT_TOKEN}` },
        });
    } catch (error) {
        console.error(`Error in postSlackMessage to ${channel}:`, error.response?.data || error.message);
    }
}

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
