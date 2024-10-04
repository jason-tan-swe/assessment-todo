export const sortByMostRecentDateFirst = (a, b) => {
    if (a.created > b.created) {
        return -1;
    }
    else if (a.created < b.created) {
        return 1;
    }
    return 0;
}
