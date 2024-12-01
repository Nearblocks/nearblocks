export async function register() {
    const { BaselimeSDK, BetterHttpInstrumentation, VercelPlugin } =
      await import('@baselime/node-opentelemetry');

    const sdk = new BaselimeSDK({
      instrumentations: [
        new BetterHttpInstrumentation({
          plugins: [
            // Add the Vercel plugin to enable correlation between your logs and traces for projects deployed on Vercel
            new VercelPlugin(),
          ],
        }),
      ],
      serverless: true,
    });

    sdk.start();
}
