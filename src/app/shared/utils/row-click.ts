// A row that opens on click: dragging across its text to copy it also ends in a click on the row. True for that click,
// so the row can stay put. A click on a link or button in the row always counts
export function endsTextSelectionInRow(event: Event, selection: Selection | null = window.getSelection()): boolean {
    const target = event.target;
    if (!(target instanceof Element) || !selection || selection.isCollapsed || target.closest('a, button')) {
        return false;
    }
    const row = target.closest('tbody tr.cursor-pointer');
    return !!row && !!selection.anchorNode && row.contains(selection.anchorNode);
}
