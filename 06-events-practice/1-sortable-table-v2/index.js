export default class SortableTable {
  element;
  subElements;

  constructor(headerConfig = [], {
    data = [],
    sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc'
    }
  } = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.isSortLocally = true;
    this.sorted = sorted;

    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    const { id, order } = this.sorted;
    const sortedData = this.sortData(id, order);

    wrapper.innerHTML = this.getTable(sortedData);

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

    this.initEventListeners();
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

  getTable(data) {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(data)}
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
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getTableHeaderSortingArrow(id)}
      </div>
    `;
  }

  getTableHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  getTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableBodyRows(data)}
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

  onSortClick = event => {
    const column = event.target.closest('[data-sortable="true"]');
    const toggleOrder = order => {
      const orders = {asc: 'desc', desc: 'asc'};

      return orders[order];
    };

    if (!column || !this.element.contains(column)) return;

    const id = column.dataset.id;
    const order = toggleOrder(column.dataset.order);
    const sortedData = this.sortData(id, order);
    const arrow = column.querySelector('.sortable-table__sort-arrow');

    column.dataset.order = order;

    if (!arrow) {
      column.append(this.subElements.arrow);
    }

    this.subElements.body.innerHTML = this.getTableBodyRows(sortedData);
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
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

