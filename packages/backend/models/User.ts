import bcrypt from 'bcryptjs';
import dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { ValueType } from 'dynamoose/dist/Schema';
import { v4 as uuid } from 'uuid';
import { decryptData, encryptData } from '../utils/encryption.ts';
import { ResourceScope } from './Resource.ts';

const { Schema, model } = dynamoose;

export interface MFACredential {
  id: string;
  publicKey: Buffer;
  counter: number;
  deviceName: string;
}

export interface UserMfa {
  preference: string;
  recoveryCodes: string[];
  app: {
    secret: string;
    subscriber: string;
    verified: boolean;
  };
  sms: {
    subscriber: string;
    verified: boolean;
  };
  email: {
    subscriber: string;
    verified: boolean;
  };
  passkey: {
    credentials: MFACredential[];
    verified: boolean;
  };
}

export interface UserItem extends Item {
  userId: string;
  email: string;
  emailVerified: boolean;
  roles: string[];
  firstName: string;
  lastName: string;
  mobile?: string;
  password: string;
  mfa: UserMfa;
  lastLoggedIn: number;
  failedLogins: number;
  suspended: boolean;
  credentials: MFACredential[];
  resources: ResourceScope[];
}

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
      index: {
        name: 'email-index',
        type: 'global',
      },
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
    resources: {
      type: Array,
      schema: [
        {
          type: Object,
          schema: {
            id: { type: String },
            scopes: {
              type: Array,
              schema: [String],
            },
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
const User = model<UserItem>('User', UserSchema);

export default User;
