import Marionette from 'backbone.marionette';
import MeView from './MeView';

export default Marionette.Application.extend({
  region: '#app',

  onStart() {
    this.showView(new MeView());
  }
});
