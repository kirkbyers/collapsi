/**
 * DOM Mocks
 * Comprehensive DOM and browser API mocking utilities for testing
 */

/**
 * localStorage mock implementation
 */
export const createLocalStorageMock = () => {
  let store = {};

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn((index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
    get length() {
      return Object.keys(store).length;
    },
    // Helper methods for testing
    _getStore: () => store,
    _setStore: (newStore) => { store = newStore; }
  };
};

/**
 * sessionStorage mock implementation
 */
export const createSessionStorageMock = () => {
  let store = {};

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn((index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
    get length() {
      return Object.keys(store).length;
    },
    // Helper methods for testing
    _getStore: () => store,
    _setStore: (newStore) => { store = newStore; }
  };
};

/**
 * DOM Element mock factory
 */
export const createElementMock = (tagName = 'div', options = {}) => {
  const {
    id = '',
    className = '',
    innerHTML = '',
    textContent = '',
    attributes = {},
    style = {},
    dataset = {}
  } = options;

  const element = {
    tagName: tagName.toUpperCase(),
    id,
    className,
    innerHTML,
    textContent,
    attributes: { ...attributes },
    style: { ...style },
    dataset: { ...dataset },
    
    // Properties
    children: [],
    childNodes: [],
    parentNode: null,
    parentElement: null,
    nextSibling: null,
    previousSibling: null,
    firstChild: null,
    lastChild: null,
    
    // Event handling
    eventListeners: {},
    addEventListener: jest.fn((event, handler, options) => {
      if (!element.eventListeners[event]) {
        element.eventListeners[event] = [];
      }
      element.eventListeners[event].push({ handler, options });
    }),
    removeEventListener: jest.fn((event, handler) => {
      if (element.eventListeners[event]) {
        element.eventListeners[event] = element.eventListeners[event].filter(
          listener => listener.handler !== handler
        );
      }
    }),
    dispatchEvent: jest.fn((event) => {
      if (element.eventListeners[event.type]) {
        element.eventListeners[event.type].forEach(listener => {
          listener.handler(event);
        });
      }
      return true;
    }),
    
    // DOM manipulation
    appendChild: jest.fn((child) => {
      element.children.push(child);
      element.childNodes.push(child);
      child.parentNode = element;
      child.parentElement = element;
      element.lastChild = child;
      if (element.children.length === 1) {
        element.firstChild = child;
      }
      return child;
    }),
    removeChild: jest.fn((child) => {
      const index = element.children.indexOf(child);
      if (index > -1) {
        element.children.splice(index, 1);
        element.childNodes.splice(index, 1);
        child.parentNode = null;
        child.parentElement = null;
        if (element.children.length === 0) {
          element.firstChild = null;
          element.lastChild = null;
        } else {
          element.firstChild = element.children[0] || null;
          element.lastChild = element.children[element.children.length - 1] || null;
        }
      }
      return child;
    }),
    insertBefore: jest.fn((newChild, referenceChild) => {
      const index = element.children.indexOf(referenceChild);
      if (index > -1) {
        element.children.splice(index, 0, newChild);
        element.childNodes.splice(index, 0, newChild);
      } else {
        element.appendChild(newChild);
      }
      return newChild;
    }),
    
    // Query methods
    querySelector: jest.fn(() => null),
    querySelectorAll: jest.fn(() => []),
    getElementsByTagName: jest.fn(() => []),
    getElementsByClassName: jest.fn(() => []),
    getElementById: jest.fn(() => null),
    
    // Attribute methods
    getAttribute: jest.fn((name) => element.attributes[name] || null),
    setAttribute: jest.fn((name, value) => {
      element.attributes[name] = value;
    }),
    removeAttribute: jest.fn((name) => {
      delete element.attributes[name];
    }),
    hasAttribute: jest.fn((name) => name in element.attributes),
    
    // Class methods
    classList: {
      add: jest.fn((...classes) => {
        classes.forEach(cls => {
          if (!element.className.includes(cls)) {
            element.className = element.className ? `${element.className} ${cls}` : cls;
          }
        });
      }),
      remove: jest.fn((...classes) => {
        classes.forEach(cls => {
          element.className = element.className
            .split(' ')
            .filter(c => c !== cls)
            .join(' ');
        });
      }),
      toggle: jest.fn((cls, force) => {
        const hasClass = element.className.includes(cls);
        if (force !== undefined) {
          if (force && !hasClass) {
            element.classList.add(cls);
            return true;
          } else if (!force && hasClass) {
            element.classList.remove(cls);
            return false;
          }
          return force;
        } else {
          if (hasClass) {
            element.classList.remove(cls);
            return false;
          } else {
            element.classList.add(cls);
            return true;
          }
        }
      }),
      contains: jest.fn((cls) => element.className.includes(cls)),
      replace: jest.fn((oldClass, newClass) => {
        if (element.classList.contains(oldClass)) {
          element.classList.remove(oldClass);
          element.classList.add(newClass);
          return true;
        }
        return false;
      })
    },
    
    // Focus/blur methods
    focus: jest.fn(),
    blur: jest.fn(),
    
    // Click method
    click: jest.fn(),
    
    // Dimension properties (can be set for testing)
    offsetWidth: 0,
    offsetHeight: 0,
    clientWidth: 0,
    clientHeight: 0,
    scrollWidth: 0,
    scrollHeight: 0,
    offsetTop: 0,
    offsetLeft: 0,
    
    // Scroll methods
    scrollIntoView: jest.fn(),
    
    // Form-specific methods (for input elements)
    select: jest.fn(),
    setSelectionRange: jest.fn(),
    
    // Helper methods for testing
    _trigger: (eventType, eventData = {}) => {
      const event = createEventMock(eventType, { target: element, ...eventData });
      element.dispatchEvent(event);
    },
    _setDimensions: (width, height) => {
      element.offsetWidth = width;
      element.offsetHeight = height;
      element.clientWidth = width;
      element.clientHeight = height;
    }
  };

  return element;
};

/**
 * Event mock factory
 */
export const createEventMock = (type, options = {}) => {
  const {
    target = null,
    currentTarget = null,
    bubbles = false,
    cancelable = false,
    detail = null,
    ...customProps
  } = options;

  return {
    type,
    target: target || createElementMock(),
    currentTarget: currentTarget || target || createElementMock(),
    bubbles,
    cancelable,
    detail,
    defaultPrevented: false,
    eventPhase: 2, // AT_TARGET
    timeStamp: Date.now(),
    
    // Event methods
    preventDefault: jest.fn(function() {
      this.defaultPrevented = true;
    }),
    stopPropagation: jest.fn(),
    stopImmediatePropagation: jest.fn(),
    
    // Custom properties
    ...customProps
  };
};

/**
 * Touch event mock factory
 */
export const createTouchEventMock = (type, options = {}) => {
  const {
    touches = [],
    targetTouches = [],
    changedTouches = [],
    target = null,
    ...eventOptions
  } = options;

  const baseEvent = createEventMock(type, { target, ...eventOptions });
  
  return {
    ...baseEvent,
    touches,
    targetTouches,
    changedTouches
  };
};

/**
 * Touch object mock factory
 */
export const createTouchMock = (options = {}) => {
  const {
    identifier = 0,
    target = null,
    clientX = 0,
    clientY = 0,
    pageX = 0,
    pageY = 0,
    screenX = 0,
    screenY = 0,
    radiusX = 1,
    radiusY = 1,
    rotationAngle = 0,
    force = 1
  } = options;

  return {
    identifier,
    target: target || createElementMock(),
    clientX,
    clientY,
    pageX,
    pageY,
    screenX,
    screenY,
    radiusX,
    radiusY,
    rotationAngle,
    force
  };
};

/**
 * Document mock factory
 */
export const createDocumentMock = () => {
  const documentElement = createElementMock('html');
  const body = createElementMock('body');
  const head = createElementMock('head');
  
  documentElement.appendChild(head);
  documentElement.appendChild(body);

  return {
    documentElement,
    body,
    head,
    
    // Query methods
    querySelector: jest.fn(() => null),
    querySelectorAll: jest.fn(() => []),
    getElementsByTagName: jest.fn(() => []),
    getElementsByClassName: jest.fn(() => []),
    getElementById: jest.fn(() => null),
    
    // Creation methods
    createElement: jest.fn((tagName) => createElementMock(tagName)),
    createTextNode: jest.fn((data) => ({ nodeType: 3, data, textContent: data })),
    createEvent: jest.fn((type) => createEventMock(type)),
    
    // Event methods
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    
    // Properties
    title: '',
    readyState: 'complete',
    activeElement: body,
    
    // Methods
    hasFocus: jest.fn(() => true),
    
    // Helper methods for testing
    _setTitle: (title) => { document.title = title; },
    _setActiveElement: (element) => { document.activeElement = element; }
  };
};

/**
 * Window mock factory
 */
export const createWindowMock = () => {
  const mockWindow = {
    // Storage
    localStorage: createLocalStorageMock(),
    sessionStorage: createSessionStorageMock(),
    
    // Dimensions
    innerWidth: 1024,
    innerHeight: 768,
    outerWidth: 1024,
    outerHeight: 768,
    
    // Location
    location: {
      href: 'http://localhost',
      protocol: 'http:',
      host: 'localhost',
      hostname: 'localhost',
      port: '',
      pathname: '/',
      search: '',
      hash: '',
      origin: 'http://localhost',
      reload: jest.fn(),
      replace: jest.fn(),
      assign: jest.fn()
    },
    
    // Navigation
    history: {
      length: 1,
      state: null,
      back: jest.fn(),
      forward: jest.fn(),
      go: jest.fn(),
      pushState: jest.fn(),
      replaceState: jest.fn()
    },
    
    // Timers
    setTimeout: jest.fn((callback, delay) => {
      return setTimeout(callback, delay);
    }),
    clearTimeout: jest.fn((id) => {
      clearTimeout(id);
    }),
    setInterval: jest.fn((callback, delay) => {
      return setInterval(callback, delay);
    }),
    clearInterval: jest.fn((id) => {
      clearInterval(id);
    }),
    
    // Animation
    requestAnimationFrame: jest.fn((callback) => {
      return setTimeout(callback, 16);
    }),
    cancelAnimationFrame: jest.fn((id) => {
      clearTimeout(id);
    }),
    
    // Events
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    
    // Console
    console: {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn()
    },
    
    // Performance
    performance: {
      now: jest.fn(() => Date.now())
    },
    
    // Methods
    alert: jest.fn(),
    confirm: jest.fn(() => true),
    prompt: jest.fn(() => ''),
    
    // Helper methods for testing
    _setDimensions: (width, height) => {
      mockWindow.innerWidth = width;
      mockWindow.innerHeight = height;
      mockWindow.outerWidth = width;
      mockWindow.outerHeight = height;
    }
  };

  return mockWindow;
};

/**
 * Set up all DOM mocks for testing environment
 */
export const setupDOMMocks = () => {
  const mockDocument = createDocumentMock();
  const mockWindow = createWindowMock();
  
  // Set global objects
  global.document = mockDocument;
  global.window = mockWindow;
  global.localStorage = mockWindow.localStorage;
  global.sessionStorage = mockWindow.sessionStorage;
  global.performance = mockWindow.performance;
  
  // Add window dimension helper directly to window object
  global.window._setDimensions = mockWindow._setDimensions;
  
  // Set up common DOM methods on global scope
  global.Element = function() {};
  global.HTMLElement = function() {};
  global.HTMLCollection = function() {};
  global.NodeList = function() {};
  
  return {
    document: mockDocument,
    window: mockWindow,
    localStorage: mockWindow.localStorage,
    sessionStorage: mockWindow.sessionStorage
  };
};

/**
 * Clean up all DOM mocks
 */
export const cleanupDOMMocks = () => {
  delete global.document;
  delete global.window;
  delete global.localStorage;
  delete global.sessionStorage;
  delete global.performance;
  delete global.Element;
  delete global.HTMLElement;
  delete global.HTMLCollection;
  delete global.NodeList;
};