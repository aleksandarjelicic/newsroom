import { gettext, notify } from 'utils';
import server from 'server';


export const SELECT_USER = 'SELECT_USER';
export function selectUser(id) {
    return function (dispatch) {
        dispatch(select(id));
    };
}

function select(id) {
    return {type: SELECT_USER, id};
}

export const EDIT_USER = 'EDIT_USER';
export function editUser(event) {
    return {type: EDIT_USER, event};
}

export const NEW_USER = 'NEW_USER';
export function newUser(data) {
    return {type: NEW_USER, data};
}

export const CANCEL_EDIT = 'CANCEL_EDIT';
export function cancelEdit(event) {
    return {type: CANCEL_EDIT, event};
}

export const SET_QUERY = 'SET_QUERY';
export function setQuery(query) {
    return {type: SET_QUERY, query};
}

export const QUERY_USERS = 'QUERY_USERS';
export function queryUsers() {
    return {type: QUERY_USERS};
}

export const GET_USERS = 'GET_USERS';
export function getUsers(data) {
    return {type: GET_USERS, data};
}

export const GET_COMPANIES = 'GET_COMPANIES';
export function getCompanies(data) {
    return {type: GET_COMPANIES, data};
}

export const SET_ERROR = 'SET_ERROR';
export function setError(errors) {
    return {type: SET_ERROR, errors};
}

function errorHandler(error, dispatch) {
    console.error('error', error);

    if (error.response.status !== 400) {
        notify.error(error.response.statusText);
        return;
    }
    error.response.json().then(function(data) {
        dispatch(setError(data));
    });
}


/**
 * Fetches users
 *
 */
export function fetchUsers() {
    return function (dispatch, getState) {
        dispatch(queryUsers());
        const query = getState().query || '';

        return server.get(`/users/search?q=${query}`)
            .then((data) => dispatch(getUsers(data)))
            .catch((error) => errorHandler(error, dispatch));
    };
}


/**
 * Creates new users
 *
 */
export function postUser() {
    return function (dispatch, getState) {

        const user = getState().userToEdit;
        const url = `/users/${user._id ? user._id : 'new'}`;

        return server.post(url, user)
            .then(function() {
                if (user._id) {
                    notify.success(gettext('User updated successfully'));
                } else {
                    notify.success(gettext('User created successfully'));
                }
                dispatch(fetchUsers());
            })
            .catch((error) => errorHandler(error, dispatch));

    };
}


export function resetPassword() {
    return function (dispatch, getState) {

        const user = getState().userToEdit;
        const url = `/users/${user._id}/reset_password`;

        return server.post(url, {})
            .then(() => notify.success(gettext('Reset password token is sent successfully')))
            .catch((error) => errorHandler(error, dispatch));

    };
}

/**
 * Deletes a user
 *
 */
export function deleteUser() {
    return function (dispatch, getState) {

        const user = getState().userToEdit;
        const url = `/users/${user._id}`;

        return server.del(url)
            .then(() => {
                notify.success(gettext('User deleted successfully'));
                dispatch(fetchUsers());
            })
            .catch((error) => errorHandler(error, dispatch));
    };
}

export function initViewData(data) {
    return function (dispatch) {
        dispatch(getUsers(data.users));
        dispatch(getCompanies(data.companies));
        //return {type: INIT_VIEW_DATA, data};
    };
}

