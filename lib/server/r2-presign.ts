import { AwsClient } from "aws4fetch";
import type { CloudflareEnv } from "./kv";

const BUCKET_NAME = "hamzaone-custom-creations";

export async function presignGetUrl(env: CloudflareEnv, key: string, expirySeconds = 300): Promise<string> {
  const accountId = typeof env.R2_ACCOUNT_ID === "string" ? env.R2_ACCOUNT_ID : "";
  const accessKeyId = typeof env.R2_ACCESS_KEY_ID === "string" ? env.R2_ACCESS_KEY_ID : "";
  const secretAccessKey = typeof env.R2_SECRET_ACCESS_KEY === "string" ? env.R2_SECRET_ACCESS_KEY : "";

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 presigning is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY (see .env.example) using an R2 API token created in the Cloudflare dashboard.",
    );
  }

  const client = new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region: "auto" });
  const url = new URL(`https://${accountId}.r2.cloudflarestorage.com/${BUCKET_NAME}/${key}`);
  url.searchParams.set("X-Amz-Expires", String(expirySeconds));

  const signed = await client.sign(new Request(url, { method: "GET" }), { aws: { signQuery: true } });
  return signed.url;
}
