import * as yup from 'yup';

const schema = yup
  .object({
    clientId: yup.string().required(),
    clientName: yup.string().required(),
    grants: yup.array().of(yup.string().required()).min(1).required(),
    scopes: yup.array().of(yup.string().required()).min(1).required(),
    redirectUris: yup
      .array()
      .of(
        yup.object({
          id: yup.string().required('redirect uri id is required'),
          value: yup.string().url('url is invalid').required('url is required'),
        }),
      )
      .min(1, 'atleast one url should be present')
      .required('url is required'),
  })
  .required();

export default schema;
