import dynamoose from 'dynamoose';

const { Schema, model } = dynamoose;

const OIDCStoreSchema = new Schema(
  {
    id: {
      type: String,
      hashKey: true,
    },
    payload: {
      type: Object,
    },
    expiresAt: {
      type: Number,
    },
    userCode: {
      type: String,
    },
    uid: {
      type: String,
    },
    grantId: {
      type: String,
    },
  },
  {
    timestamps: true,
    saveUnknown: ['payload.**'],
  },
);
const OIDCStore = model('OIDCStore', OIDCStoreSchema, {
  expires: {
    ttl: 7 * 24 * 60 * 60,
    attribute: 'expiresAt',
    items: {
      returnExpired: false,
    },
  },
});

export default OIDCStore;
