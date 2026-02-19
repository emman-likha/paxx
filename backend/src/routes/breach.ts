import { Elysia, t } from 'elysia';

const HIBP_RANGE_API = 'https://api.pwnedpasswords.com/range';

export const breachRoutes = new Elysia({ prefix: '/breach' })
    .post(
        '/check-passwords',
        async ({ body }) => {
            const results: { id: string; compromised: boolean; exposures: number }[] = [];

            for (const entry of body.passwords) {
                const prefix = entry.hash.substring(0, 5).toUpperCase();
                const suffix = entry.hash.substring(5).toUpperCase();

                try {
                    const res = await fetch(`${HIBP_RANGE_API}/${prefix}`, {
                        headers: { 'user-agent': 'Paxx-BreachMonitor' },
                    });

                    if (!res.ok) {
                        results.push({ id: entry.id, compromised: false, exposures: 0 });
                        continue;
                    }

                    const text = await res.text();
                    const lines = text.split('\r\n');
                    let exposures = 0;

                    for (const line of lines) {
                        const [hashSuffix, count] = line.split(':');
                        if (hashSuffix === suffix) {
                            exposures = parseInt(count, 10);
                            break;
                        }
                    }

                    results.push({ id: entry.id, compromised: exposures > 0, exposures });
                } catch (err) {
                    console.error(`Failed to check hash for id ${entry.id}:`, err);
                    results.push({ id: entry.id, compromised: false, exposures: 0 });
                }
            }

            return { results };
        },
        {
            body: t.Object({
                passwords: t.Array(
                    t.Object({
                        id: t.String(),
                        hash: t.String({ minLength: 40, maxLength: 40 }),
                    }),
                    { minItems: 1, maxItems: 100 }
                ),
            }),
        }
    );
