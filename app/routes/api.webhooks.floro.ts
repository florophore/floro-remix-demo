import { createHmac } from "crypto";
import { ActionFunctionArgs, json } from "@remix-run/node";
import metaFile from "../floro_infra/floro_modules/meta.floro";
import {
  LocalizedPhrases,
} from "~/floro_infra/floro_modules/text-generator";
import { getJSON } from "@floro/text-generator";
import StaticLocaleStorageAccessor from "~/backend/StaticLocalesStorageAccessor";
import FloroTextStore from "~/backend/FloroTextStore";
import { getUpdatedText, shortHash } from "~/floro_infra/serverhelpers/text";

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json(); // Parse JSON request body
  const signature = request.headers.get("floro-signature-256");
  const stringPayload = JSON.stringify(body);
  const hmac = createHmac("sha256", process?.env?.FLORO_WEBHOOK_SECRET ?? "");
  const reproducedSignature =
    "sha256=" + hmac.update(stringPayload).digest("hex");

  // we're confirming the request came from floro
  if (signature == reproducedSignature) {
    if (body.event == "test") {
      return json(
        {},
        {
          status: 200,
        }
      );
    }
    // we're confirming we're talking about the correct repo
    if (body?.repositoryId != metaFile.repositoryId) {
      return json(
        {},
        {
          status: 200,
        }
      );
    }
    const payload = body?.payload;
    // we're confirming the floro branch was not updated to a null commit state
    if (!payload?.branch?.lastCommit) {
      return json(
        {},
        {
          status: 200,
        }
      );
    }
    // we only care when the main branch is changed
    if (payload?.branch?.id != "main") {
      return json(
        {},
        {
          status: 200,
        }
      );
    }
    try {
      // In prod this should be https://api.floro.io
      // In dev you can query your local floro daemon at http://localhost:63403. This allows you to confirm
      // the webhook logic works as expected
      const apiServer =
        process?.env?.FLORO_API_SERVER ?? "http://localhost:63403";
      // first we request a link. In prod, the link is a signed url pointing to the floro CDN, in dev it's just
      // a link to your commit state from your floro daemon
      const stateLinkRequest = await fetch(
        `${apiServer}/public/api/v0/repository/${metaFile.repositoryId}/commit/${payload.branch.lastCommit}/stateLink`,
        {
          headers: {
            "floro-api-key": process?.env?.FLORO_API_KEY ?? "",
          },
        }
      );
      if (!stateLinkRequest) {
        return json(
          {},
          {
            status: 400,
          }
        );
      }
      const { stateLink } = await stateLinkRequest.json();
      if (!stateLink) {
        return json(
          {},
          {
            status: 400,
          }
        );
      }
      const stateRequest = await fetch(stateLink);
      // We now retrieve the state of the commit. The state is in non-KV form
      // (ie. it is the tree state representation of the commit).
      const state = await stateRequest.json();
      if (!state?.store?.text) {
        return json(
          {},
          {
            status: 400,
          }
        );
      }
      const textUpdateJSON: LocalizedPhrases = await getJSON(state.store);
      const textUpdate = getUpdatedText(textUpdateJSON);
      const loadsLoads: { [key: string]: string } = {};

      for (const localeCode in textUpdate.localizedPhraseKeys) {
        const jsonString = JSON.stringify(
          textUpdate.localizedPhraseKeys[
            localeCode as keyof typeof textUpdate.localizedPhraseKeys
          ]
        );
        const sha = shortHash(jsonString);
        const fileName = `${localeCode}.${sha}.json`;
        // write to disk or upload to CDN here
        // Here we are actually uploading the storage bucket our CDN read from in prod.
        // This would be something like S3
        const didWrite = await StaticLocaleStorageAccessor.writeLocales(
          fileName,
          jsonString
        );
        if (didWrite) {
          loadsLoads[localeCode] = fileName;
        } else {
          // if we don't write, then don't publish
          return json(
            {},
            {
              status: 400,
            }
          );
        }
      }
      // If everthing succeeds we can now update our text store. All SSR and client code will consume
      // the updated content
      FloroTextStore.getInstance().setText(
        payload.branch.lastCommit,
        textUpdate,
        loadsLoads
      );
      return json(
        {},
        {
          status: 200,
        }
      );
    } catch (e) {
      console.log("Text update failed", e);
      return json(
        {
          message: "You dun goof'd",
        },
        {
          status: 500,
        }
      );
    }
  }
}

export function meta() {
  return {
    status: 200,
    type: "application/json",
    allowCredentials: true,
    allowMethods: ["POST"],
  };
}
