import SortableList from '../2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements = {};
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  };

  constructor(productId) {
    this.productId = productId;
  }

  get template() {
    return `
      <div class="product-form">
        <form class="form-grid" data-element="productForm">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input
                id="title"
                type="text"
                name="title"
                class="form-control"
                placeholder="Название товара"
                required
              >
            </fieldset>
          </div>

          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea
              id="description"
              class="form-control"
              name="description"
              data-element="productDescription"
              placeholder="Описание товара"
              required
            ></textarea>
          </div>

          <div class="form-group form-group__wide">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer"></div>
            <button data-element="uploadImage" type="button" class="button-primary-outline">
              <span>Загрузить</span>
            </button>
          </div>

          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            ${this.createCategoriesSelect()}
          </div>

          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input
                id="price"
                type="number"
                name="price"
                class="form-control"
                placeholder="${this.defaultFormData.price}"
                required
              >
            </fieldset>

            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input
                id="discount"
                type="number"
                name="discount"
                class="form-control"
                placeholder="${this.defaultFormData.discount}"
                required
              >
            </fieldset>
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input
              id="quantity"
              type="number"
              class="form-control"
              name="quantity"
              placeholder="${this.defaultFormData.quantity}"
              required
            >
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select id="status" class="form-control" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>

          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              ${this.productId ? 'Сохранить' : 'Добавить'} товар
            </button>
          </div>
        </form>
      </div>
    `;
  }

  get emptyTemplate() {
    return `
      <div class="product-form">
        <h1 class="page-title">Страница не найдена</h1>
        <p>Извините, данный товар не существует</p>
      </div>
    `;
  }

  async render() {
    await this.loadData();

    this.renderForm();

    if (this.formData) {
      this.setFormData();
      this.createImagesList();
      this.initEventListeners();
    }

    return this.element;
  }

  renderForm() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.formData ? this.template : this.emptyTemplate;

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);
  }

  async loadData() {
    const categoriesPromise = this.loadCategories();
    const productPromise = this.productId ? this.loadProduct() : [this.defaultFormData];

    const [categoriesData, productData] = await Promise.all([categoriesPromise, productPromise]);

    this.formData = productData[0];
    this.categories = categoriesData;
  }

  loadProduct() {
    return fetchJson(`${BACKEND_URL}/api/rest/products?id=${this.productId}`);
  }

  loadCategories() {
    return fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  getFormData() {
    const { productForm, imageListContainer } = this.subElements;
    const excludedFields = ['images'];
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));
    const values = {};

    for (const field of fields) {
      const value = productForm.elements[field].value;

      values[field] = formatToNumber.includes(field) ? parseInt(value) : value;
    }

    values.images = [];
    values.id = this.productId;

    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.alt
      });
    }

    return values;
  }

  setFormData() {
    const { productForm } = this.subElements;
    const excludedFields = ['images'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));

    fields.forEach(field => {
      const element = productForm.elements[field];

      element.value = this.formData[field];

      if (field === 'subcategory' && !this.formData[field]) {
        element.selectedIndex = 0;
      }
    });
  }

  dispatchEvent(id) {
    const type = this.productId ? 'product-updated' : 'product-saved';

    this.element.dispatchEvent(new CustomEvent(type, { bubbles: true, detail: id }));
  }

  createCategoriesSelect() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `<select id="subcategory" class="form-control" name="subcategory"></select>`;

    const select = wrapper.firstElementChild;

    for (const category of this.categories) {
      for (const subcategory of category.subcategories) {
        select.append(new Option(`${category.title} > ${subcategory.title}`, subcategory.id));
      }
    }

    return select.outerHTML;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  createImagesList() {
    const { imageListContainer } = this.subElements;
    const sortableList = new SortableList({
      items: this.formData.images.map(({ url, source }) => {
        const wrapper = document.createElement('div');

        wrapper.innerHTML = this.getImageItem(url, source);

        return wrapper.firstElementChild;
      })
    });

    imageListContainer.append(sortableList.element);
  }

  getImageItem(url, name) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(name)}</span>
        </span>
        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;
  }

  async save() {
    const product = this.getFormData();

    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      this.dispatchEvent(result.id);
    } catch (error) {
      console.error(error);
    }
  }

  onSubmit = event => {
    event.preventDefault();

    this.save();
  }

  onUploadImage = () => {
    const input = document.createElement('input');

    input.type = 'file';
    input.accept = 'image/*';
    // input.multiple = true;

    input.addEventListener('change', async () => {
      const [file] = input.files;

      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append('image', file);

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        try {
          const result = await fetchJson('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: {
              Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
            },
            body: formData
          });
          const wrapper = document.createElement('div');

          wrapper.innerHTML = this.getImageItem(result.data.link, file.name);

          imageListContainer.append(wrapper.firstElementChild);
        } catch (error) {
          console.log(error);
        }

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        input.remove();
      }
    });

    input.hidden = true;
    document.body.append(input);

    input.click();
  }

  onDeleteImage = event => {
    if (event.target.closest('[data-delete-handle]')) {
      event.preventDefault();

      event.target.closest('li').remove();
    }
  }

  initEventListeners() {
    const { productForm, uploadImage, imageListContainer } = this.subElements;

    productForm.addEventListener('submit', this.onSubmit);
    uploadImage.addEventListener('click', this.onUploadImage);
    imageListContainer.addEventListener('click', this.onDeleteImage);
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}

