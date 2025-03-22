export type ResortFunction = (
    source_index: number,
    destination_index: number | undefined,
) => Promise<boolean | undefined>;

export const resort_list = <T>(
    list: T[],
    source_index: number,
    destination_index: number | undefined,
): T[] | boolean => {
    if (destination_index === undefined) return false;

    if (source_index === destination_index) {
        console.error('same source_index with destination_index', source_index, destination_index);
        return false;
    }

    if (source_index < 0) return false;
    if (destination_index < 0) return false;
    if (source_index === destination_index) return true;

    if (list.length <= source_index) return false;

    const next = [...list];

    const source = next[source_index];
    const destination = next[destination_index];

    if (!destination) {
        next.splice(source_index, 1); // delete old
        next.push(source); // insert new
    } else if (destination_index < source_index) {
        next.splice(source_index, 1); // delete old
        next.splice(destination_index, 1, source, destination); // insert new
    } else if (source_index < destination_index) {
        next.splice(source_index, 1); // delete old
        next.splice(destination_index - 1, 1, destination, source); // insert new
    }

    return next;
};
