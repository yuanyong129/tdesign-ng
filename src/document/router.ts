import { RouterConfiguration, Route } from '@microsoft/fast-router';
import { Button } from './button';

type RouteSettings = {
  public?: boolean
};

export class AppRouterConfiguration extends RouterConfiguration<RouteSettings> {
  public configure() {
    this.title = 'Arco Design FAST';
    // this.defaultLayout = pageLayout;
    this.routes.map(
      { path: '', redirect: 'button' },
      { path: 'button', title: 'button', element: new Button() },
    //   { 
    //     path: 'account', 
    //     layout: anonymousLayout, 
    //     title: 'Account',
    //     settings: { public: true }, 
    //     children: [
    //       { path: "login", title: 'Login', element: AccountLogin, name: 'login' },
    //       { path: 'signup' title: 'Signup', element: AccountSignup },
    //       { path: 'confirm/{confirmation:Confirmation}', title: 'Confirm', element: ConfirmEmail },
    //       { path: 'settings', title: 'Settings', element: AccountSettings, layout: pageLayout, settings: { public: false } },
    //     ] 
    //   },
    //   { path: 'store', title: 'Store', element: StoreArea, childRouters: true },
    //   { path: 'not-found', title: 'Not Found', element: NotFound }
    );

    // this.routes.fallback(
    //   () => {}
    // );

    // this.routes.converter("Confirmation", async (confirmationId) => {
    //   // ...fetch confirmation from web service...
    //   return confirmation;
    // });

    // this.contributors.push({
    //   navigate(phase) {
    //     const settings = phase.route.settings;
  
    //     if (settings && settings.public) {
    //       return;
    //     }
  
    //     if (Session.loggedIn) {
    //       return;
    //     }
  
    //     phase.cancel(() => {
    //       Session.returnUrl = Route.path.current;
    //       Route.name.replace(phase.router, 'login');
    //     });
    //   }
    // });
  }
}