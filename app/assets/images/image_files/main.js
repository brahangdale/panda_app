'use strict';

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.register('/blog/wp-content/themes/boredpanda/push/sw.js?v=20')
    .then(function (swReg) {
      swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array('BDxIuTZrFc8qWFESGXe3lnod2ReOOQ0vo6xhOly2DiMkZsCsBmIoLVSWRCiznIXelKgLVUeJyNIEjNv6vKIXD_I')
      })
        .then(function (subscription) {
          var cookie = $.cookie('web_push');
          var stringifiedJson = JSON.stringify(subscription);

          if (typeof cookie === 'undefined' || cookie !== stringifiedJson) {
            $.ajax({
              method: 'POST',
              url: 'https://n.boredpanda.com/notifications/web',
              data: {
                user_id: 0,
                subscription: stringifiedJson
              }
            }).done(function () {
              $.cookie('web_push', stringifiedJson, {expires: 365});
            });
          }
        })
        .catch(function (err) {

        });
    })
    .catch(function (error) {

    });
} else {

}
