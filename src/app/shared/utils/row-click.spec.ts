import {endsTextSelectionInRow} from './row-click';

describe('endsTextSelectionInRow', () => {
    let table: HTMLTableElement;
    let cell: HTMLElement;

    const select = (node: Node) => {
        const range = document.createRange();
        range.selectNodeContents(node);
        window.getSelection()!.removeAllRanges();
        window.getSelection()!.addRange(range);
    };
    const clickOn = (target: Element) => {
        let result = false;
        const listener = (event: Event) => result = endsTextSelectionInRow(event);
        document.addEventListener('click', listener, true);
        target.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        document.removeEventListener('click', listener, true);
        return result;
    };

    beforeEach(() => {
        table = document.createElement('table');
        table.innerHTML = `<tbody>
            <tr class="cursor-pointer"><td id="name">Mieszkanie</td><td><button id="menu">Menu</button></td></tr>
            <tr class="cursor-pointer"><td id="other">Dom</td></tr>
            <tr><td id="plain">Footer</td></tr>
        </tbody>`;
        document.body.appendChild(table);
        cell = table.querySelector('#name')!;
    });

    afterEach(() => {
        window.getSelection()!.removeAllRanges();
        table.remove();
    });

    it('is true for a click that ends selecting text in the row', () => {
        select(cell);
        expect(clickOn(cell)).toBeTrue();
    });

    it('is false for a plain click with nothing selected', () => {
        window.getSelection()!.removeAllRanges();
        expect(clickOn(cell)).toBeFalse();
    });

    it('is false for a click on another row than the selected text', () => {
        select(cell);
        expect(clickOn(table.querySelector('#other')!)).toBeFalse();
    });

    it('is false for a button in the row', () => {
        select(cell);
        expect(clickOn(table.querySelector('#menu')!)).toBeFalse();
    });

    it("is false for a row that doesn't open on click", () => {
        select(table.querySelector('#plain')!);
        expect(clickOn(table.querySelector('#plain')!)).toBeFalse();
    });
});
