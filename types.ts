/**
 *  we are using Object.freeze to make it immutable.
 * @see [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
*/ 
const UserRoles = Object.freeze({
    REGULAR: 'regular',
    ADMIN: 'admin',
});

export { UserRoles }