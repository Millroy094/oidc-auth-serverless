import dynamoose from 'dynamoose';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { ValueType } from 'dynamoose/dist/Schema';
import { decryptData, encryptData } from '../utils/encryption.ts';

const { Schema, model } = dynamoose;

const UserSchema = new Schema(
  {
    userId: {
      type: String,
      hashKey: true,
      default: () => uuid(),
    },
    email: {
      type: String,
      required: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    roles: {
      type: Array,
      schema: [String],
      default: [],
    },
    firstName: {
      type: String,
      default: '',
    },
    lastName: {
      type: String,
      default: '',
    },
    mobile: {
      type: String,
    },
    password: {
      type: String,
      set: async (value, oldValue) => {
        if (!value) {
          return '';
        }

        if (value === oldValue) {
          return value;
        }

        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(value as string, salt);
        return encryptedPassword;
      },
    },
    mfa: {
      type: Object,
      schema: {
        preference: {
          type: String,
        },
        recoveryCodes: {
          type: Array,
          schema: [String],
        },
        app: {
          type: Object,
          schema: {
            secret: {
              type: String,
              set: (value: ValueType) =>
                value ? encryptData(value as string) : '',
              get: (value: ValueType) =>
                value ? decryptData(value as string) : '',
            },
            subscriber: {
              type: String,
            },
            verified: {
              type: Boolean,
            },
          },
        },
        sms: {
          type: Object,
          schema: {
            subscriber: {
              type: String,
            },
            verified: {
              type: Boolean,
            },
          },
        },
        email: {
          type: Object,
          schema: {
            subscriber: {
              type: String,
            },
            verified: {
              type: Boolean,
            },
          },
        },
        passkey: {
          type: Object,
          schema: {
            credentials: {
              type: Array,
              schema: [
                {
                  type: Object,
                  schema: {
                    id: { type: String },
                    publicKey: {
                      type: Buffer,
                    },
                    counter: { type: Number },
                    deviceName: { type: String },
                  },
                },
              ],
            },
            verified: {
              type: Boolean,
            },
          },
        },
      },
      default: {
        preference: '',
        recoveryCodes: [],
        app: {
          secret: '',
          subscriber: '',
          verified: false,
        },
        sms: {
          subscriber: '',
          verified: false,
        },
        email: {
          subscriber: '',
          verified: false,
        },
        passkey: {
          credentials: [],
          verified: false,
        },
      },
    },
    lastLoggedIn: {
      type: Number,
      default: 0,
    },
    failedLogins: { type: Number, default: 0 },
    suspended: {
      type: Boolean,
      default: false,
    },
    credentials: {
      type: Array,
      schema: [
        {
          type: Object,
          schema: {
            id: { type: String },
            publicKey: {
              type: Buffer,
            },
            counter: { type: Number },
            deviceName: { type: String },
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);
const User = model('User', UserSchema);

export default User;
