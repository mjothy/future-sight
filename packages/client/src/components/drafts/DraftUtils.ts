import { v1 as uuidv1 } from 'uuid';

const DRAFTS = "drafts"

export function setDrafts(drafts) {
    localStorage.setItem(DRAFTS, JSON.stringify(drafts))
}

export function getDrafts () : Record<string, any>{
    let drafts = {}
    const storage = localStorage.getItem(DRAFTS)
    if (storage) {
        drafts = JSON.parse(storage)
    } else {
        setDrafts(drafts)
    }
    return drafts
}

export function getDraft(draftId) : Record<string, any> | undefined {
    const drafts = getDrafts();
    if (draftId in drafts) {
        return drafts[draftId];
    }
    return undefined
}

export function setDraft(id, conf) {
    const drafts = getDrafts();
    drafts[id] = conf;
    setDrafts(drafts)
}

export function removeDraft(draftId) {
    const drafts = getDrafts()
    delete drafts[draftId]
    setDrafts(drafts)
}

export function createUUID () {
    let uuid = uuidv1();
    // Make sure that the key is not already taken
    const drafts = getDrafts();
    while (uuid in drafts) {
        uuid = uuidv1();
    }
    return uuid
}
