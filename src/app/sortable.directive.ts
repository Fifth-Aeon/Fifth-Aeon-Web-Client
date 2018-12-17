import { Directive, ElementRef, EventEmitter, HostListener, Output, AfterContentInit } from '@angular/core';

@Directive({
  selector: '[ccgSortable]'
})
export class SortableDirective implements AfterContentInit {
  @Output() orderChanged = new EventEmitter();

  private _draggingElement: HTMLElement;
  private _dropSucceded: boolean;
  private _isInsideContainer: boolean;

  constructor(private element: ElementRef) { }

  ngAfterContentInit() {
    this.setDataAttributesToChildren();
    this.savePositions('orgIndex');
  }

  @HostListener('dragstart', ['$event'])
  dragStart(event) {
    this.savePositions('dragIndex');
    this._draggingElement = this.getDraggableElement(event);
    this._dropSucceded = false;
    this._isInsideContainer = true;

    // If you prefer to set an image while dragging
    // let img = new Image();
    // img.src = 'YOUR-IMAGE.PNG';
    // event.dataTransfer.setDragImage(img, 10, 10);

    // Change body class if something has to be done while dragging
    document.body.classList.add('dragging-mode');

    // Defer adding current element dragging class to let th browser to take a snapshot of the selected element
    setTimeout(() => {
      this._draggingElement.classList.add('dragging');
    });
  }

  @HostListener('dragend', ['$event'])
  dragEnd(event: MouseEvent) {
    if (!this._dropSucceded) {
      this.cancelDragging();
    }
    // Remove dragging CSS classes
    document.body.classList.remove('dragging-mode');
    this._draggingElement.classList.remove('dragging');
    this.element.nativeElement.classList.remove('dragging-outside');

    event.preventDefault();
  }

  @HostListener('dragover', ['$event'])
  dragOver(event: MouseEvent) {
    // Required to receive "drop"" event
    event.preventDefault();
  }

  @HostListener('drag', ['$event'])
  drag(event) {
    // Check if mouse is outside container or not
    const divCoords = this.element.nativeElement.getBoundingClientRect();
    const inside = (event.clientX >= divCoords.left &&
      event.clientX <= divCoords.right &&
      event.clientY >= divCoords.top &&
      event.clientY <= divCoords.bottom);
    // Check if mouse mouves outside container
    if (this._isInsideContainer && !inside) {
      this.element.nativeElement.classList.add('dragging-outside');
      this.cancelDragging();
    } else if (!this._isInsideContainer && inside) {
          // Else check if mouse moves back inside container

      this.element.nativeElement.classList.remove('dragging-outside');
    }

    this._isInsideContainer = inside;
  }

  @HostListener('dragenter', ['$event'])
  dragEnter(event: MouseEvent) {
    // Search for "draggable" element under the mouse
    const element: HTMLElement = this.getDraggableElement(event);

    if (element && element.attributes) {
      const draggingIndex = this._draggingElement.dataset['index'];
      const dropIndex = element.dataset['index'];

      if (draggingIndex !== dropIndex) {
        // Move dragging ghost element at its new position
        if (draggingIndex > dropIndex) {
          this.element.nativeElement.insertBefore(this._draggingElement, element);
        } else {
          this.element.nativeElement.insertBefore(this._draggingElement, element.nextSibling);
        }
        this.setDataAttributesToChildren();
      }
    }

    event.preventDefault();
  }

  @HostListener('drop', ['$event'])
  drop(event: MouseEvent) {
    this._dropSucceded = true;
    let values = [];
    for (let i = 0; i < this.element.nativeElement.childElementCount; i++) {
      let element = this.element.nativeElement.children[i];
      values.push(element.dataset.orgIndex);
    }

    this.orderChanged.emit(values);

    event.preventDefault();
  }

  private setDataAttributesToChildren() {
    for (let i = 0; i < this.element.nativeElement.childElementCount; i++) {
      let element = this.element.nativeElement.children[i];
      element.draggable = true;
      element.dataset.index = i;
    }
  }

  private savePositions(attribute) {
    for (let i = 0; i < this.element.nativeElement.childElementCount; i++) {
      let element = this.element.nativeElement.children[i];
      element.dataset[attribute] = i;
    }
  }

  private getElementAt(attribute, index) {
    for (let i = 0; i < this.element.nativeElement.childElementCount; i++) {
      let element = this.element.nativeElement.children[i];
      if (parseInt(element.dataset[attribute], 10) === index) {
        return element;
      }
    }
    return null;
  }

  private cancelDragging() {
    let index = this.element.nativeElement.childElementCount - 1;
    // Get last element
    let beforeElement = this.getElementAt('dragIndex', index);

    while (index > 0) {
      const element = this.getElementAt('dragIndex', index - 1);
      this.element.nativeElement.insertBefore(element, beforeElement);

      beforeElement = element;
      index--;
    }
  }

  private getDraggableElement(event): HTMLElement {
    // Search for "draggable" element under the mouse
    let element: HTMLElement = <HTMLElement>event.target;
    while (element && element.attributes && !element.attributes['draggable']) {
      element = <HTMLElement>element.parentNode;
    }
    return element;
  }
}
