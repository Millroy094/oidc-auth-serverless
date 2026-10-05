import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, Key } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import schema from './schema';
import { ISettingsInput } from './type';
import getSettings, { ISettings } from '@/api/admin/get-settings';
import updateSettings from '@/api/admin/update-settings';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import useFeedback from '@/hooks/useFeedback';

const SECONDS_PER_MINUTE = 60;

const toFormValues = (settings: ISettings): ISettingsInput => ({
  accessTokenTtl: Math.round(settings.accessTokenTtl / SECONDS_PER_MINUTE),
  idTokenTtl: Math.round(settings.idTokenTtl / SECONDS_PER_MINUTE),
  refreshTokenTtl: Math.round(settings.refreshTokenTtl / SECONDS_PER_MINUTE),
  sessionTtl: Math.round(settings.sessionTtl / SECONDS_PER_MINUTE),
  grantTtl: Math.round(settings.grantTtl / SECONDS_PER_MINUTE),
  registrationEnabled: settings.registrationEnabled,
  rotateRefreshTokenOnUse: settings.rotateRefreshTokenOnUse,
  passkeyAttestationType: settings.passkeyAttestationType || 'none',
  passkeyAuthenticatorAttachment:
    settings.passkeyAuthenticatorAttachment || 'platform',
  passkeyChallengeTimeout: settings.passkeyChallengeTimeout || 300,
  passkeyMaxPerUser: settings.passkeyMaxPerUser ?? 0,
  passkeyCrossDeviceSessionTimeout:
    settings.passkeyCrossDeviceSessionTimeout || 600,
});

const toApiValues = (input: ISettingsInput): ISettings => ({
  accessTokenTtl: input.accessTokenTtl * SECONDS_PER_MINUTE,
  idTokenTtl: input.idTokenTtl * SECONDS_PER_MINUTE,
  refreshTokenTtl: input.refreshTokenTtl * SECONDS_PER_MINUTE,
  sessionTtl: input.sessionTtl * SECONDS_PER_MINUTE,
  grantTtl: input.grantTtl * SECONDS_PER_MINUTE,
  registrationEnabled: input.registrationEnabled,
  rotateRefreshTokenOnUse: input.rotateRefreshTokenOnUse,
  passkeyAttestationType: input.passkeyAttestationType,
  passkeyAuthenticatorAttachment: input.passkeyAuthenticatorAttachment,
  passkeyChallengeTimeout: input.passkeyChallengeTimeout,
  passkeyMaxPerUser: input.passkeyMaxPerUser,
  passkeyCrossDeviceSessionTimeout: input.passkeyCrossDeviceSessionTimeout,
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
    control,
    formState: { errors, isSubmitting },
  } = useForm<ISettingsInput>({
    resolver: zodResolver(schema),
    criteriaMode: 'all',
    mode: 'onChange',
    defaultValues: {
      passkeyAttestationType: 'none',
      passkeyAuthenticatorAttachment: 'platform',
      passkeyChallengeTimeout: 300,
      passkeyMaxPerUser: 0,
      passkeyCrossDeviceSessionTimeout: 600,
    },
    values: settings ?? undefined,
  });

  const fetchSettings = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await getSettings();
      setSettings(toFormValues(response.data.settings));
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
      const response = await updateSettings(toApiValues(data));
      feedbackAxiosResponse(
        response,
        'Successfully updated settings',
        'success',
      );
      setSettings(toFormValues(response.data.settings));
    } catch (err) {
      feedbackAxiosError(
        err,
        'There was an issue updating settings, please try again',
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        {/* Token & Session Settings Card */}
        <Card className="border-t-4 border-t-primary shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  Token & Session Settings
                </CardTitle>
                <CardDescription>
                  Configure OIDC tokens, sessions, and grants validity periods.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
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

                <div className="pt-2 border-t">
                  <Controller
                    name="registrationEnabled"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <label
                        htmlFor="registrationEnabled"
                        className="flex items-center gap-2 cursor-pointer w-fit mt-4"
                      >
                        <Checkbox
                          id="registrationEnabled"
                          checked={value}
                          onCheckedChange={onChange}
                        />
                        <span className="text-sm">
                          Allow new user registration
                        </span>
                      </label>
                    )}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    When disabled, the registration page rejects new sign-ups.
                    Existing users can still log in.
                  </p>

                  <Controller
                    name="rotateRefreshTokenOnUse"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <label
                        htmlFor="rotateRefreshTokenOnUse"
                        className="flex items-center gap-2 cursor-pointer w-fit mt-4"
                      >
                        <Checkbox
                          id="rotateRefreshTokenOnUse"
                          checked={value}
                          onCheckedChange={onChange}
                        />
                        <span className="text-sm">
                          Always rotate refresh tokens on use
                        </span>
                      </label>
                    )}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    When disabled, refresh tokens follow the provider&apos;s
                    adaptive rotation policy instead of rotating on every use.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Passkey Settings Card */}
        <Card className="border-t-4 border-t-primary shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Passkey Settings</CardTitle>
                <CardDescription>
                  Configure WebAuthn passkey authentication options.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="passkeyAttestationType"
                    className="block text-sm font-medium mb-1"
                  >
                    Attestation Type
                  </label>
                  <Controller
                    name="passkeyAttestationType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="passkeyAttestationType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            None (Trust client)
                          </SelectItem>
                          <SelectItem value="direct">
                            Direct (Verify certificate)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Trust client for faster registration, or verify
                    authenticator certificate for higher security.
                  </p>
                  {errors.passkeyAttestationType && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.passkeyAttestationType?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="passkeyAuthenticatorAttachment"
                    className="block text-sm font-medium mb-1"
                  >
                    Authenticator Types
                  </label>
                  <Controller
                    name="passkeyAuthenticatorAttachment"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="passkeyAuthenticatorAttachment">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="platform">
                            Platform only (Face ID, Touch ID, Windows Hello)
                          </SelectItem>
                          <SelectItem value="cross-platform">
                            External only (YubiKey, security keys)
                          </SelectItem>
                          <SelectItem value="all">
                            Both types allowed
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose which authenticators users can register.
                  </p>
                  {errors.passkeyAuthenticatorAttachment && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.passkeyAuthenticatorAttachment?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="passkeyChallengeTimeout"
                    className="block text-sm font-medium mb-1"
                  >
                    Challenge Timeout (seconds)
                  </label>
                  <Input
                    {...register('passkeyChallengeTimeout', {
                      valueAsNumber: true,
                    })}
                    id="passkeyChallengeTimeout"
                    type="number"
                    min={30}
                    max={3600}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    How long a passkey registration/authentication challenge
                    remains valid (30-3600 seconds).
                  </p>
                  {errors.passkeyChallengeTimeout && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.passkeyChallengeTimeout?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="passkeyMaxPerUser"
                    className="block text-sm font-medium mb-1"
                  >
                    Max Passkeys Per User
                  </label>
                  <Input
                    {...register('passkeyMaxPerUser', { valueAsNumber: true })}
                    id="passkeyMaxPerUser"
                    type="number"
                    min={0}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum passkeys each user can register (0 = unlimited).{' '}
                    <strong>Note:</strong> Existing passkeys are not affected
                    when reducing this limit.
                  </p>
                  {errors.passkeyMaxPerUser && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.passkeyMaxPerUser?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="passkeyCrossDeviceSessionTimeout"
                    className="block text-sm font-medium mb-1"
                  >
                    Cross-Device Session Timeout (seconds)
                  </label>
                  <Input
                    {...register('passkeyCrossDeviceSessionTimeout', {
                      valueAsNumber: true,
                    })}
                    id="passkeyCrossDeviceSessionTimeout"
                    type="number"
                    min={60}
                    max={3600}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    How long QR code sessions remain valid for cross-device
                    passkey registration (60-3600 seconds).
                  </p>
                  {errors.passkeyCrossDeviceSessionTimeout && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.passkeyCrossDeviceSessionTimeout?.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading || isSubmitting}>
            Save settings
          </Button>
        </div>
      </div>
    </form>
  );
};

export default Settings;
