import Marionette from 'backbone.marionette';
import MeView from './MeView';
import HeaderView from './HeaderView';

export default Marionette.Application.extend({
  regions: {
    app: '#app',
    header: '#header'
  },

  onStart() {
    this.showView(new MeView());
  }

  onRender: function() {
    this.showChildView('header', new HeaderView());
    this.showChildView('footer', new FooterView());
  }
});
