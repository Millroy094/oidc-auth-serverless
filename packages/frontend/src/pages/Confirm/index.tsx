import { FC } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Typography,
  styled,
} from '@mui/material';

import { useParams } from 'react-router-dom';

import authorizeInteraction from '../../api/oidc/authorize-interaction';
import useFeedback from '../../hooks/useFeedback';

const StyledCard = styled(Card)({
  borderTop: '2px solid red',
});

const Confirm: FC = () => {
  const { interactionId } = useParams();
  const { feedbackAxiosError } = useFeedback();
  const onAuthorize = async (authorize: boolean): Promise<void> => {
    try {
      const response = await authorizeInteraction(
        interactionId ?? '',
        authorize,
      );
      if (response.data.redirect) {
        window.location.href = response.data.redirect;
      }
    } catch (err) {
      feedbackAxiosError(err, 'Failed to authorize request, please try again.');
    }
  };

  return (
    <Container maxWidth="sm">
      <StyledCard sx={{ marginTop: 15 }}>
        <CardHeader title="Authorize" />
        <CardContent>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <Typography>
                Can you confirm you want to authorize this request?
              </Typography>
            </Grid>
            <Grid item container spacing={1}>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={() => onAuthorize(true)}
                  color="success"
                >
                  Yes
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={() => onAuthorize(false)}
                  color="error"
                >
                  No
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </StyledCard>
    </Container>
  );
};

export default Confirm;
