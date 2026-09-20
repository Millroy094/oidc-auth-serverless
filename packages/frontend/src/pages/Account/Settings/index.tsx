import { zodResolver } from '@hookform/resolvers/zod';
import { Clock } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import schema from './schema';
import { ISettingsInput } from './type';
import getSettings, { ITtlSettings } from '@/api/admin/get-settings';
import updateSettings from '@/api/admin/update-settings';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import useFeedback from '@/hooks/useFeedback';

const SECONDS_PER_MINUTE = 60;

const toMinutes = (settings: ITtlSettings): ISettingsInput => ({
  accessTokenTtl: Math.round(settings.accessTokenTtl / SECONDS_PER_MINUTE),
  idTokenTtl: Math.round(settings.idTokenTtl / SECONDS_PER_MINUTE),
  refreshTokenTtl: Math.round(settings.refreshTokenTtl / SECONDS_PER_MINUTE),
  sessionTtl: Math.round(settings.sessionTtl / SECONDS_PER_MINUTE),
  grantTtl: Math.round(settings.grantTtl / SECONDS_PER_MINUTE),
});

const toSeconds = (input: ISettingsInput): ITtlSettings => ({
  accessTokenTtl: input.accessTokenTtl * SECONDS_PER_MINUTE,
  idTokenTtl: input.idTokenTtl * SECONDS_PER_MINUTE,
  refreshTokenTtl: input.refreshTokenTtl * SECONDS_PER_MINUTE,
  sessionTtl: input.sessionTtl * SECONDS_PER_MINUTE,
  grantTtl: input.grantTtl * SECONDS_PER_MINUTE,
});

const fields: { name: keyof ISettingsInput; label: string; help: string }[] = [
  {
    name: 'accessTokenTtl',
    label: 'Access token lifetime',
    help: 'How long issued access tokens remain valid.',
  },
  {
    name: 'idTokenTtl',
    label: 'ID token lifetime',
    help: 'How long issued ID tokens remain valid.',
  },
  {
    name: 'refreshTokenTtl',
    label: 'Refresh token lifetime',
    help: 'How long a refresh token can be used to obtain new tokens.',
  },
  {
    name: 'sessionTtl',
    label: 'Session lifetime',
    help: 'How long a signed-in browser session stays valid without re-authenticating.',
  },
  {
    name: 'grantTtl',
    label: 'Grant lifetime',
    help: "How long a client's consent grant remains valid.",
  },
];

const Settings: FC = () => {
  const [settings, setSettings] = useState<ISettingsInput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { feedbackAxiosResponse, feedbackAxiosError } = useFeedback();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ISettingsInput>({
    resolver: zodResolver(schema),
    criteriaMode: 'all',
    mode: 'onChange',
    values: settings ?? undefined,
  });

  const fetchSettings = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await getSettings();
      setSettings(toMinutes(response.data.settings));
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue retrieving settings, please try again',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: ISettingsInput): Promise<void> => {
    try {
      const response = await updateSettings(toSeconds(data));
      feedbackAxiosResponse(
        response,
        'Successfully updated settings',
        'success',
      );
      setSettings(toMinutes(response.data.settings));
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue updating settings, please try again',
      );
    }
  };

  return (
    <Card className="border-t-4 border-t-primary shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl">Token & Session Settings</CardTitle>
            <CardDescription>
              Configure how long OIDC tokens, sessions, and grants remain valid,
              in minutes.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map(({ name, label, help }) => (
                <div key={name}>
                  <label
                    htmlFor={name}
                    className="block text-sm font-medium mb-1"
                  >
                    {label} (minutes)
                  </label>
                  <Input
                    {...register(name, { valueAsNumber: true })}
                    id={name}
                    type="number"
                    min={5}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{help}</p>
                  {errors[name] && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors[name]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isLoading || isSubmitting}>
            Save settings
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default Settings;
