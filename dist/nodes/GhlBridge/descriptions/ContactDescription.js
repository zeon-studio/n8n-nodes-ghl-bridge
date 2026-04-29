"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactFields = exports.contactOperations = void 0;
exports.contactOperations = {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['contact'] } },
    options: [
        { name: 'Create', value: 'create', action: 'Create a contact' },
        { name: 'Delete', value: 'delete', action: 'Delete a contact' },
        { name: 'Get', value: 'get', action: 'Get a contact' },
        { name: 'Get All', value: 'getAll', action: 'Get all contacts' },
        { name: 'Search', value: 'search', action: 'Search contacts' },
        { name: 'Update', value: 'update', action: 'Update a contact' },
        { name: 'Add Tags', value: 'addTags', action: 'Add tags to a contact' },
        { name: 'Remove Tags', value: 'removeTags', action: 'Remove tags from a contact' },
    ],
    default: 'get',
};
exports.contactFields = [
    // ── GET / DELETE / ADD TAGS / REMOVE TAGS ──────────────────────────────
    {
        displayName: 'Contact ID',
        name: 'contactId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: { show: { resource: ['contact'], operation: ['get', 'delete', 'update', 'addTags', 'removeTags'] } },
        description: 'The ID of the contact',
    },
    // ── GET ALL ─────────────────────────────────────────────────────────────
    {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 20,
        typeOptions: { minValue: 1, maxValue: 100 },
        displayOptions: { show: { resource: ['contact'], operation: ['getAll'] } },
        description: 'Max number of results to return',
    },
    // ── SEARCH ──────────────────────────────────────────────────────────────
    {
        displayName: 'Search Query',
        name: 'query',
        type: 'string',
        required: true,
        default: '',
        displayOptions: { show: { resource: ['contact'], operation: ['search'] } },
        description: 'Name, email or phone to search for',
    },
    // ── CREATE ──────────────────────────────────────────────────────────────
    {
        displayName: 'First Name',
        name: 'firstName',
        type: 'string',
        default: '',
        displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
    },
    {
        displayName: 'Last Name',
        name: 'lastName',
        type: 'string',
        default: '',
        displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
    },
    {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        placeholder: 'name@email.com',
        default: '',
        displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
    },
    {
        displayName: 'Phone',
        name: 'phone',
        type: 'string',
        default: '',
        displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
    },
    {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: { show: { resource: ['contact'], operation: ['create', 'update'] } },
        options: [
            { displayName: 'Company Name', name: 'companyName', type: 'string', default: '' },
            { displayName: 'Website', name: 'website', type: 'string', default: '' },
            { displayName: 'Address', name: 'address1', type: 'string', default: '' },
            { displayName: 'City', name: 'city', type: 'string', default: '' },
            { displayName: 'State', name: 'state', type: 'string', default: '' },
            { displayName: 'Postal Code', name: 'postalCode', type: 'string', default: '' },
            { displayName: 'Country', name: 'country', type: 'string', default: '' },
            { displayName: 'Source', name: 'source', type: 'string', default: '' },
            { displayName: 'Tags (comma-separated)', name: 'tags', type: 'string', default: '' },
        ],
    },
    // ── TAGS ────────────────────────────────────────────────────────────────
    {
        displayName: 'Tags',
        name: 'tags',
        type: 'string',
        required: true,
        default: '',
        displayOptions: { show: { resource: ['contact'], operation: ['addTags', 'removeTags'] } },
        description: 'Comma-separated list of tags',
    },
];
