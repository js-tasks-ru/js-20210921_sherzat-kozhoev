export default class NotificationMessage {
  static activeNotification;
  element;
  timerId;

  constructor(message = '', {type = '', duration = 1000} = {}) {
    this.message = message;
    this.type = type;
    this.duration = duration;
    this.durationInSeconds = (this.duration / 1000) + 's';

    this.render();
  }

  get template () {
    return `
      <div class="notification ${this.type}" style="--value:${this.durationInSeconds}">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">${this.message}</div>
        </div>
      </div>
    `;
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
  }

  show(parent = document.body) {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
    }

    parent.append(this.element);

    this.timerId = setTimeout(() => this.remove(), this.duration);

    NotificationMessage.activeNotification = this;
  }

  remove() {
    clearTimeout(this.timerId);

    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    NotificationMessage.activeNotification = null;
  }
}
