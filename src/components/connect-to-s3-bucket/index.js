import AWS from 'aws-sdk';
import React, { useState } from 'react';
import { withRouter, useHistory } from 'react-router-dom';
import { Button, Form, Message, Dimmer, Loader } from 'semantic-ui-react';
import './ConnectToS3Bucket.scss';

const regions = [
  { key: 'us-east-2', text: 'US East (Ohio)', value: 'us-east-2' },
  { key: 'us-east-1', text: 'US East (N. Virginia)', value: 'us-east-1' },
  {
    key: 'us-west-1',
    text: 'US West (N. California)',
    value: 'us-west-1'
  },
  { key: 'us-west-2', text: 'US West (Oregon)', value: 'us-west-2' },
  { key: 'af-south-1', text: 'Africa (Cape Town)', value: 'af-south-1' },
  {
    key: 'ap-east-1',
    text: 'Asia Pacific (Hong Kong)',
    value: 'ap-east-1'
  },
  {
    key: 'ap-northeast-3',
    text: 'Asia Pacific (Osaka-Local)',
    value: 'ap-northeast-3'
  },
  {
    key: 'ap-northeast-2',
    text: 'Asia Pacific (Seoul)',
    value: 'ap-northeast-2'
  },
  {
    key: 'ap-southeast-1',
    text: 'Asia Pacific (Singapore)',
    value: 'ap-southeast-1'
  },
  {
    key: 'ap-southeast-2',
    text: 'Asia Pacific (Sydney)',
    value: 'ap-southeast-2'
  },
  {
    key: 'ap-northeast-1',
    text: 'Asia Pacific (Tokyo)',
    value: 'ap-northeast-1'
  },
  {
    key: 'ca-central-1',
    text: 'Canada (Central)',
    value: 'ca-central-1'
  },
  { key: 'cn-north-1', text: 'China (Beijing)', value: 'cn-north-1' },
  {
    key: 'cn-northwest-1',
    text: 'China (Ningxia)',
    value: 'cn-northwest-1'
  },
  {
    key: 'eu-central-1',
    text: 'Europe (Frankfurt)',
    value: 'eu-central-1'
  },
  { key: 'eu-west-1', text: 'Europe (Ireland)', value: 'eu-west-1' },
  { key: 'eu-west-2', text: 'Europe (London)', value: 'eu-west-2' },
  { key: 'eu-south-1', text: 'Europe (Milan)', value: 'eu-south-1' },
  { key: 'eu-west-3', text: 'Europe (Paris)', value: 'eu-west-3' },
  { key: 'eu-north-1', text: 'Europe (Stockholm)', value: 'eu-north-1' },
  {
    key: 'sa-east-1',
    text: 'South America (São Paulo)',
    value: 'sa-east-1'
  }
];

function ConnectToS3BucketForm() {
  const [state, setState] = useState([
    {
      bucketName: process.env.REACT_APP_BUCKET,
      accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
      secretAccessKey: process.env.REACT_APP_ACCESS_KEY_ID,
      selectedRegion: process.env.REACT_APP_AWS_REGION
    }
  ]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const connectToS3Bucket = async ({
    bucketName,
    accessKeyId,
    secretAccessKey,
    region
  }) => {
    const genericError =
      'Hmm... There appears to be an issue creating a connection to the bucket (however we are not sure why). Please try again.';

    AWS.config.setPromisesDependency();

    try {
      const s3 = new AWS.S3({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        region: region
      });
      await s3.headBucket({ Bucket: bucketName }).promise();
      history.push(
        {
          pathname: '/bucket-viewer'
        },
        {
          bucket: { accessKeyId, secretAccessKey, region, name: bucketName }
        }
      );
    } catch (error) {
      if (error.code == null) {
        setError(genericError);
        setLoading(false);
      } else {
        if (error.code === 'Forbidden') {
          setError(
            'Forbidden: We are unable to establish a connection. Please validate your credentials and try again.'
          );
          setLoading(false);
        }
        if (error.code === 'NetworkError') {
          setError(
            'Network Error: We are unable to establish a connection due to the network. Please validate your connection and try again.'
          );
          setLoading(false);
        } else {
          setError(genericError);
          setLoading(false);
        }
      }
    }
  };

  const handleS3BucketSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    connectToS3Bucket({
      bucketName: state.bucketName,
      accessKeyId: state.accessKeyId,
      secretAccessKey: state.secretAccessKey,
      selectedRegion: state.selectedRegion
    });
  };

  const handleFieldChange = (event, { name, value }) => {
    setState((prevState) => ({ ...prevState, [name]: value }));
  };

  return (
    <>
      <Dimmer active={loading}>
        <Loader indeterminate>Trying to connect to your S3 Bucket</Loader>
      </Dimmer>
      <Message className="s3-message">
        <Message.Header>Connect to S3 Bucket</Message.Header>
        {error == null ? (
          <p>Enter your S3 connection credentials below</p>
        ) : (
          <p className="error-message">{error}</p>
        )}
      </Message>
      <Form
        className="s3-form"
        onSubmit={handleS3BucketSubmit}
        error={error != null}
      >
        <Form.Input
          required
          id="form-input-s3-bucket-name"
          name="bucketName"
          label="S3 Bucket Name"
          placeholder="my-really-cool-s3-bucket-name"
          value={state.bucketName}
          onChange={handleFieldChange}
        />
        <Form.Input
          required
          id="form-control-access-key-id"
          name="accessKeyId"
          label="Access Key ID"
          placeholder="12345ABCDEFG"
          value={state.accessKeyId}
          type="password"
          onChange={handleFieldChange}
        />
        <Form.Input
          required
          id="form-control-secret-access-key-id"
          name="secretAccessKey"
          label="Secret Access Key"
          placeholder="12345ABCDEFG/B123232"
          value={state.secretAccessKey}
          type="password"
          onChange={handleFieldChange}
        />
        <Form.Select
          required
          name="selectedRegion"
          value={state.selectedRegion}
          options={regions}
          label={{
            children: 'Region',
            htmlFor: 'form-select-control-region'
          }}
          placeholder="Region"
          search
          searchInput={{
            id: 'form-select-control-region'
          }}
          onChange={handleFieldChange}
        />
        <Button type="submit" primary>
          Connect
        </Button>
      </Form>
    </>
  );
}

export default withRouter(ConnectToS3BucketForm);
