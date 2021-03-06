let self = {};
// TODO set API_URL
const API_URL = 'https://jsonplaceholder.typicode.com';

class BaseService {
  /**
   * Constructs the service
   * @param {string} path The api endpoint path (ex. /campaign)
   * @param {object} dependencies Angular dependencies to be passed to the baseService
   * @param {function} dependencies.$q Angular promise library
   * @param {function} dependencies.$resource Angular resource
   * @param {object} [options] Extra options to add to the the resource created by the service
   * @param {object} [options.actions] Extra actions in addition to get, query, create, update, save, and delete
   * @param {object} [options.params] Angular resource params to override the default @id
   * @param {object} [options.options] Angular Resource options. For more information: https://docs.angularjs.org/api/ngResource/service/$resource
   */
  constructor(path, dependencies, options = {}) {
    options.actions = options.actions || {};
    if (!path) {
      throw new TypeError('path is required');
    }

    Object.assign(self, dependencies);

    // Create the resource object
    this.resource = self.$resource(this.getAPIUrl() + path, options.params || {id: '@id'}, options.actions, options.options);

    // Convert resource actions to use angular promises instead of callbacks
    Object.keys(this.resource).forEach(key => {
      if (!this.constructor.prototype[key]) {
        this.constructor.prototype[key] = (idOrQuery, options) => this.request(key, idOrQuery, options);
      }
    });
  }

  /**
   * Makes an http request.
   * @param {string} action The resource action, ex. get, query, save, etc.
   * @param {string|object} [idOrQuery={}] The ID of the object to pass with the request or the query object.
   * @param {object} [options={}] Extra query options to pass with the request
   * @return {Promise} The response data
   */
  request(action, idOrQuery = {}, options = {}) {
    return self.$q((resolve, reject) => this.resource[action](Object.assign(options, this.parseQuery(idOrQuery)), resolve, reject));
  }

  /**
   * If a string is provided returns an object with an id property equal to the provided string, otherwise returns the passed object as it is.
   * @param {string|object} idOrObject The id id string or the query object
   * @return {object} The query object
   */
  parseQuery(idOrObject) {
    return typeof idOrObject === 'string' ? {id: idOrObject} : idOrObject;
  }

  /**
   * Returns the API URL
   * @return {string} API_URL
   */
  getAPIUrl() {
    return API_URL;
  }
}

export default BaseService;
