/**
 * CometChat Initialization - Single entry point for the entire app.
 * Called in useEffect (client-side only) guarded by a flag.
 *
 * MCP bundles consulted: react-js-sdk-quickstart, presence-typing-indicators
 * MCP tools used: list_cometchat_bundles, get_cometchat_implementation_bundle,
 *                 search_cometchat_docs, fetch_cometchat_doc_page
 */
import { CometChat } from "@cometchat/chat-sdk-javascript";

let initialized = false;

export function isCometChatConfigured(): boolean {
  const appID = process.env.NEXT_PUBLIC_COMETCHAT_APP_ID;
  const authKey = process.env.NEXT_PUBLIC_COMETCHAT_AUTH_KEY;
  return Boolean(
    appID &&
    authKey &&
    !appID.includes("your_app_id") &&
    !authKey.includes("your_auth_key")
  );
}

export async function initCometChat(): Promise<void> {
  if (initialized) return;

  if (!isCometChatConfigured()) {
    console.warn("CometChat: Placeholder credentials detected in .env.local. Running in local simulation mode.");
    initialized = true;
    return;
  }

  const appID = process.env.NEXT_PUBLIC_COMETCHAT_APP_ID!;
  const region = process.env.NEXT_PUBLIC_COMETCHAT_REGION!;

  const appSettings = new CometChat.AppSettingsBuilder()
    .setRegion(region)
    .subscribePresenceForAllUsers()
    .autoEstablishSocketConnection(true)
    .build();

  await CometChat.init(appID, appSettings);
  initialized = true;
}

export async function loginUser(uid: string): Promise<CometChat.User> {
  if (!isCometChatConfigured()) {
    const user = new CometChat.User(uid);
    user.setName(uid);
    return user;
  }

  const authKey = process.env.NEXT_PUBLIC_COMETCHAT_AUTH_KEY!;
  if (!authKey) throw new Error("Auth key missing");

  const existing = await CometChat.getLoggedinUser();
  if (existing) return existing;

  return await CometChat.login(uid, authKey);
}

export async function logoutUser(): Promise<void> {
  if (isCometChatConfigured()) {
    try {
      await CometChat.logout();
    } catch {
      // Ignore
    }
  }
}

export async function createOrUpdateUser(
  uid: string,
  name: string,
  avatar?: string
): Promise<CometChat.User> {
  if (!isCometChatConfigured()) {
    const user = new CometChat.User(uid);
    user.setName(name);
    if (avatar) user.setAvatar(avatar);
    return user;
  }

  const authKey = process.env.NEXT_PUBLIC_COMETCHAT_AUTH_KEY!;
  const user = new CometChat.User(uid);
  user.setName(name);
  if (avatar) user.setAvatar(avatar);

  try {
    return await CometChat.createUser(user, authKey);
  } catch {
    return await CometChat.updateUser(user, authKey);
  }
}

export async function createGroup(
  guid: string,
  name: string,
  icon?: string
): Promise<CometChat.Group> {
  if (!isCometChatConfigured()) {
    const group = new CometChat.Group(
      guid,
      name,
      CometChat.GROUP_TYPE.PUBLIC,
      ""
    );
    if (icon) group.setIcon(icon);
    return group;
  }

  const group = new CometChat.Group(
    guid,
    name,
    CometChat.GROUP_TYPE.PUBLIC,
    ""
  );
  if (icon) group.setIcon(icon);

  try {
    return await CometChat.createGroup(group);
  } catch {
    return await CometChat.getGroup(guid);
  }
}

export async function joinGroup(guid: string): Promise<void> {
  if (!isCometChatConfigured()) return;
  try {
    await CometChat.joinGroup(guid, CometChat.GROUP_TYPE.PUBLIC as CometChat.GroupType, "");
  } catch {
    // Already a member
  }
}

export async function sendGroupMessage(
  guid: string,
  text: string,
  metadata?: Record<string, unknown>
): Promise<CometChat.TextMessage> {
  const msg = new CometChat.TextMessage(
    guid,
    text,
    CometChat.RECEIVER_TYPE.GROUP
  );
  if (metadata) msg.setMetadata(metadata);

  if (!isCometChatConfigured()) {
    msg.setId(Date.now());
    msg.setSentAt(Math.floor(Date.now() / 1000));
    return msg;
  }

  return (await CometChat.sendMessage(msg)) as CometChat.TextMessage;
}

export async function fetchGroupMessages(
  guid: string,
  limit = 50
): Promise<CometChat.BaseMessage[]> {
  if (!isCometChatConfigured()) {
    return [];
  }
  const request = new CometChat.MessagesRequestBuilder()
    .setGUID(guid)
    .setLimit(limit)
    .build();
  return await request.fetchPrevious();
}

export async function fetchGroups(): Promise<CometChat.Group[]> {
  if (!isCometChatConfigured()) {
    return [];
  }
  const request = new CometChat.GroupsRequestBuilder().setLimit(30).build();
  return await request.fetchNext();
}

export async function fetchGroupMembers(
  guid: string
): Promise<CometChat.GroupMember[]> {
  if (!isCometChatConfigured()) {
    return [];
  }
  const request = new CometChat.GroupMembersRequestBuilder(guid)
    .setLimit(30)
    .build();
  return await request.fetchNext();
}

export { CometChat };
