export default class SortableTable {
  element;
  subElements;

  constructor(headerConfig = [], {data = []} = {}) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render();
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTable();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  getTable() {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody()}
      </div>
    `;
  }

  getTableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig.map(item => this.getTableHeaderCell(item)).join('')}
      </div>
    `;
  }

  getTableHeaderCell({id, title, sortable}) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
    `;
  }

  getTableBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableBodyRows(this.data)}
      </div>
    `;
  }

  getTableBodyRows(data) {
    return data
      .map(item => {
        const cells = this.headerConfig
          .map(({id, template}) => {
            return template ? template(item[id]) : `<div class="sortable-table__cell">${item[id]}</div>`;
          })
          .join('');

        return `<a href="/products/${item.id}" class="sortable-table__row">${cells}</a>`;
      })
      .join('');
  }

  getTableLoading() {
    return `<div data-element="loading" class="loading-line sortable-table__loading-line"></div>`;
  }

  getTableEmptyPlaceholder() {
    return `
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>
    `;
  }

  sort(field, order) {
    const sortedData = this.sortData(field, order);
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const sortColumn = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);

    allColumns.forEach(item => item.dataset.order = '');
    sortColumn.dataset.order = order;

    this.subElements.body.innerHTML = this.getTableBodyRows(sortedData);
  }

  sortData(field, order) {
    const data = [...this.data];
    const column = this.headerConfig.find(item => item.id === field);
    const { sortType } = column;
    const directions = {asc: 1, desc: -1};
    const direction = directions[order];

    return data.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[field] - b[field]);
      case 'string':
        return direction * a[field].localeCompare(b[field], ['ru', 'en'], {caseFirst: 'upper'});
      default:
        return direction * (a[field] - b[field]);
      }
    });
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}

