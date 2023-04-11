// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useEffect, useMemo} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';
import {FixedSizeList} from 'react-window';

import {UserThread} from '@mattermost/types/threads';

import {Constants} from 'utils/constants';

import Row from './virtualized_thread_list_row';
import type {ThreadRouting} from 'components/threading/hooks';

type Props = {
    ids: Array<UserThread['id']>;
    loadMoreItems: (startIndex: number, stopIndex: number) => Promise<any>;
    selectedThreadId?: UserThread['id'];
    total: number;
    isLoading?: boolean;
    addNoMoreResultsItem?: boolean;
    routing: ThreadRouting;
};

const style = {
    willChange: 'auto',
};

function VirtualizedThreadList({
    ids,
    selectedThreadId,
    loadMoreItems,
    total,
    isLoading,
    addNoMoreResultsItem,
    routing,
}: Props) {
    const infiniteLoaderRef = React.useRef<any>();
    const hasMountedRef = React.useRef<boolean>(false);
    const startIndexRef = React.useRef<number>(0);
    const stopIndexRef = React.useRef<number>(0);

    // Each time we add an item in the total we call the method resetloadMoreItemsCache to clear the cache
    useEffect(() => {
        // We only need to reset cached items when 'total' changes.
        // This effect will run on mount too; there's no need to reset in that case.
        if (hasMountedRef.current) {
            if (infiniteLoaderRef.current) {
                infiniteLoaderRef.current.resetloadMoreItemsCache();
            }
        }
        hasMountedRef.current = true;
    }, [total]);

    useEffect(() => {
        if (ids.length > 0 && selectedThreadId) {
            const index = ids.indexOf(selectedThreadId);
            if (startIndexRef.current >= index || index > stopIndexRef.current) {
                // eslint-disable-next-line no-underscore-dangle
                infiniteLoaderRef.current?._listRef.scrollToItem(index);
            }
        }

        // ids should not be on the dependency list as
        // it will auto scroll to selected item upon
        // infinite loading
        // when the selectedThreadId changes it will get
        // the new ids so no issue there
    }, [selectedThreadId]);

    const data = useMemo(
        () => {
            const cids = [...ids];
            if (addNoMoreResultsItem && ids.length === total) {
                cids.push(Constants.THREADS_NO_RESULTS_ITEM_ID);
            } else if (isLoading && ids.length !== total) {
                cids.push(Constants.THREADS_LOADING_INDICATOR_ITEM_ID);
            }

            return {
                ids: cids,
                selectedThreadId,
                routing,
            };
        },
        [ids, selectedThreadId, isLoading, addNoMoreResultsItem, total, routing],
    );

    const itemKey = useCallback((index, data) => data.ids[index], []);

    const isItemLoaded = useCallback((index) => {
        return ids.length === total || index < ids.length;
    }, [ids, total]);

    return (
        <AutoSizer>
            {({height, width}) => (
                <InfiniteLoader
                    ref={infiniteLoaderRef}
                    itemCount={total}
                    loadMoreItems={loadMoreItems}
                    isItemLoaded={isItemLoaded}
                    minimumBatchSize={Constants.THREADS_PAGE_SIZE}
                >
                    {({onItemsRendered, ref}) => {
                        return (
                            <FixedSizeList
                                onItemsRendered={({
                                    overscanStartIndex,
                                    overscanStopIndex,
                                    visibleStartIndex,
                                    visibleStopIndex,
                                }) => {
                                    onItemsRendered({
                                        overscanStartIndex,
                                        overscanStopIndex,
                                        visibleStartIndex,
                                        visibleStopIndex,
                                    });
                                    startIndexRef.current = visibleStartIndex;
                                    stopIndexRef.current = visibleStopIndex;
                                }}
                                ref={ref}
                                height={height}
                                itemCount={data.ids.length}
                                itemData={data}
                                itemKey={itemKey}
                                itemSize={133}
                                style={style}
                                width={width}
                                className='virtualized-thread-list'
                            >
                                {Row}
                            </FixedSizeList>
                        );
                    }
                    }
                </InfiniteLoader>
            )}
        </AutoSizer>
    );
}

function areEqual(prevProps: Props, nextProps: Props) {
    return (
        prevProps.selectedThreadId === nextProps.selectedThreadId &&
        prevProps.ids.join() === nextProps.ids.join() &&
        prevProps.isLoading === nextProps.isLoading &&
        prevProps.total === nextProps.total &&
        prevProps.addNoMoreResultsItem === nextProps.addNoMoreResultsItem
    );
}

export default memo(VirtualizedThreadList, areEqual);
