// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export enum LogLevel {
    Error = 'ERROR',
    Warning = 'WARNING',
    Info = 'INFO',
    Debug = 'DEBUG',
}

export type ClientResponse<T> = {
    response: Response;
    headers: Map<string, string>;
    data: T;
};

export type Options = {
    headers?: { [x: string]: string };
    method?: string;
    url?: string;
    credentials?: 'omit' | 'same-origin' | 'include';
    body?: any;
};

export type StatusOK = {
    status: 'OK';
};

export type FetchPaginatedThreadOptions = {
    fetchThreads?: boolean;
    collapsedThreads?: boolean;
    collapsedThreadsExtended?: boolean;
    direction?: 'up'|'down';
    fetchAll?: boolean;
    perPage?: number;
    fromCreateAt?: number;
    fromPost?: string;
}

export type FetchThreadOptions = {
    after?: string;
    before?: string;
    extended?: boolean;
    perPage?: number;
    since?: number;
    threadsOnly?: boolean;
    totalsOnly?: boolean;
    unread?: boolean;
    deleted?: boolean;
};

export enum FetchChannelThreadFilters {
    ALL = '',
    FOLLOWING = 'following',
    USER = 'user',
}

export type FetchChannelThreadOptions = {
    filter?: FetchChannelThreadFilters;
} & FetchThreadOptions;
