
export default function Hello<T>(clazz: new () => T): ProxyConstructor {
    let instance, handler = {
        construct: function (target, args) {
            if (!instance) {
                instance = new clazz();
            }
            return instance;
        }
    };
    return new Proxy(clazz, handler);
};