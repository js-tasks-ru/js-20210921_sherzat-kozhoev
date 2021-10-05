export default class ColumnChart {
  chartHeight = 50;

  constructor({
    data = [],
    label = '',
    link = '',
    value = 0,
    formatHeading = data => `${data}`
  } = {}) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = value;
    this.formatHeading = formatHeading;
    this.render();
  }

  getTemplate() {
    const link = this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
    const isLoading = this.data.length ? '' : 'column-chart_loading';

    return `
      <div class="column-chart ${isLoading}" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${link}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
          <div data-element="body" class="column-chart__chart">${this.getTemplateChart(this.data)}</div>
        </div>
      </div>
    `;
  }

  getTemplateChart(data) {
    if (data.length === 0) return '';

    return this.getColumnProps(data).reduce((accum, item) => {
      accum += `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`;
      return accum;
    }, '');
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
  }

  remove() {
    this.element.remove();
  }

  update(data) {
    this.data = data;
    this.render();
  }

  destroy() {
    this.remove();
  }
}
