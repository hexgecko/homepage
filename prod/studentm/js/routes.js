angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {
  // default page
  $urlRouterProvider.otherwise('/tab/class-list')
  
  // tab page
  $stateProvider
  .state('tab', {
    url: '/tab',
    templateUrl: 'templates/tab.html',
    abstract:true
  })
  
  /////////////////////////////////////////////////////////////////////////////
  // Classes
  /////////////////////////////////////////////////////////////////////////////
  .state('tab.class-list', {
    url: '/class-list',
    views: {
      'classes': {
        templateUrl: 'templates/class-list.html',
        controller: 'classListCtrl'
      }
    }
  })
  
  .state('tab.class-info', {
    url: '/class-info/:classId',
    views: {
      'classes': {
        templateUrl: 'templates/class-info.html',
        controller: 'classInfoCtrl'
      }
    }
  })
  
  .state('tab.class-report', {
    url: '/class-report/:classId',
    views: {
      'classes': {
        templateUrl: 'templates/class-report.html',
        controller: 'classReportCtrl'
      }
    }
  })
  
  .state('tab.student-info', {
    url: '/student-info/:studentId',
    views: {
      'classes': {
        templateUrl: 'templates/student-info.html',
        controller: 'studentInfoCtrl'
      }
    }
  })
  
  .state('tab.exam-info', {
    url: '/exam-info/:examId',
    views: {
      'classes': {
        templateUrl: 'templates/exam-info.html',
        controller: 'examInfoCtrl'
      }
    }
  })
  
  /////////////////////////////////////////////////////////////////////////////
  // About
  /////////////////////////////////////////////////////////////////////////////
  .state('tab.about', {
    url: '/about',
    views: {
      'about': {
        templateUrl: 'templates/about.html',
        controller: 'aboutCtrl'
      }
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // Settings
  /////////////////////////////////////////////////////////////////////////////
  .state('tab.settings', {
    url: '/settings',
    views: {
      'settings': {
        templateUrl: 'templates/settings.html',
        controller: 'settingsCtrl'
      }
    }
  })
});
