import Challenge from '../models/Challenge.ts';

class PasskeyService {
  public static decodeClientData(encodedClientData: string) {
    const base64 = encodedClientData.replace(/_/g, '/').replace(/-/g, '+');
    const binaryData = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const decodedString = new TextDecoder().decode(binaryData);
    return JSON.parse(decodedString);
  }

  public static async createChallenge(
    userId: string,
    challenge: string,
  ): Promise<void> {
    await Challenge.create({
      userId,
      challenge,
      expiresAt: Math.floor(Date.now() / 1000) + 300,
    });
  }

  public static async retrieveChallenge(
    userId: string,
    challenge: string,
  ): Promise<string> {
    const [challengeResult] = await Challenge.scan('userId')
      .eq(userId)
      .and()
      .where('challenge')
      .eq(challenge)
      .exec();

    return challengeResult?.challenge;
  }

  public static async deleteChallenge(
    userId: string,
    challenge: string,
  ): Promise<void> {
    const [challengeResult] = await Challenge.scan('userId')
      .eq(userId)
      .and()
      .where('challenge')
      .eq(challenge)
      .exec();

    if (challengeResult) {
      await challengeResult.delete();
    }
  }
}

export default PasskeyService;
