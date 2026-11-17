// The API speaks display labels ("In Progress"); the database stores enum names.
export const STATUS_LABEL = { Pending: 'Pending', Approved: 'Approved', Assigned: 'Assigned', InProgress: 'In Progress', Resolved: 'Resolved', Rejected: 'Rejected' };
export const LABEL_STATUS = Object.fromEntries(Object.entries(STATUS_LABEL).map(([k, v]) => [v, k]));
export const STATUS_LABELS = Object.values(STATUS_LABEL);
