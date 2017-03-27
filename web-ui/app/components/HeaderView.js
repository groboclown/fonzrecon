import Marionette from 'backbone.marionette';
import template from '../templates/header.jst';

export default Marionette.View.extend({
  template: template,

  ui: {
    bannnerImage: "#site-bar-banner",
    titleText: "#site-bar-title"
  }
});
