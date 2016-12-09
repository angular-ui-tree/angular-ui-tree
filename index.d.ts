// Type definitions for angular-ui-tree v2.8.0
// Project: https://github.com/angular-ui-tree/angular-ui-tree
// Definitions by: Morten Novak Bro https://github.com/bronielsen 
// Last update: 2016-12-08

/// <reference types="angular" />

import * as ng from 'angular';

declare module 'angular' {
    export namespace ui.tree {

        interface IEventInfo {
            dest: IEventDestInfo;
            elements: IElementsInfo;
            pos: IPosition;
            source: IEventSourceInfo;
        }

        interface IEventDestInfo {
            index: number;
            nodesScope: ITreeNodesScope;
        }

        interface IEventSourceInfo {
            cloneModel: any;
            index: number;
            nodeScope: ITreeNodeScope;
            nodesScope: ITreeNodesScope;
        }

        interface IElementsInfo {
            placeholder: any;
            dragging: any;
        }

        interface IPosition {
            dirAx: number;
            dirX: number;
            dirY: number;
            distAxX: number;
            distAxY: number;
            distX: number;
            distY: number;
            lastDirX: number;
            lastDirY: number;
            lastX: number;
            lastY: number;
            moving: boolean;
            nowX: number;
            nowY: number;
            offsetX: number;
            offsetY: number;
            startX: number;
            startY: number;
        }

        interface ICallbacks {
            accept?: IAcceptCallback;
            beforeDrag?: IBeforeDragCallback;
            beforeDrop?: IBeforeDropCallback;
            dragStart?: IDroppedCallback;
            dragMove?: IDroppedCallback;
            dragStop?: IDroppedCallback;
            dropped?: IDroppedCallback;
            removed?: IRemovedCallback;
            toggle?: IToggleCallback;
        }

        interface IAcceptCallback {
            (source: ITreeNodeScope, destination: ITreeNodesScope, destIndex: number): boolean;
        }

        interface IBeforeDragCallback {
            (source: ITreeNodeScope): boolean;
        }

        interface IBeforeDropCallback {
            (event: IEventInfo): (ng.IPromise<any> | boolean);
        }

        interface IDroppedCallback {
            (eventInfo: IEventInfo): void;
        }

        interface IRemovedCallback {
            (node: ITreeNodeScope): void;
        }

        interface IToggleCallback {
            (collapsed: boolean, sourceNodeScope: ITreeNodeScope): void;
        }

        interface ITreeScope extends ng.IScope { // scope of ui-tree
            // Attributes
            readonly nodropEnabled: boolean;
            readonly cloneEnabled: boolean;
            readonly dragEnabled: boolean;
            readonly maxDepth: boolean;
            readonly dragDelay: boolean;
            readonly emptyPlaceholderEnabled: boolean;

            // Callbacks
            $callbacks: ICallbacks;
        }

        interface ITreeNodesScope extends ng.IScope { // scope of ui-tree-nodes
            // Attributes
            nodropEnabled: boolean;
            maxDepth: boolean;

            // Properties
            $element: ng.IAugmentedJQuery; //AngularElement;
            $modelValue: Object;
            $nodes: ITreeNodeScope[];
            $nodeScope: ITreeNodeScope;

            // Methods
            depth: () => number;
            outOfDepth: (sourceNode: ITreeNodeScope) => boolean;
            isParent: (nodeScope: ITreeNodeScope) => boolean;
            childNodes: () => ITreeNodeScope[];
        }

        interface ITreeNodeScope extends ng.IScope { // scope of ui-tree-node
            // Attributes
            readonly nodrag: boolean;
            collapsed: boolean;
            readonly expandOnHover: (boolean | number);
            readonly scrollContainer: string;

            // Properties
            $element: ng.IAugmentedJQuery; //AngularElement;
            $modelValue: Object;
            $parentNodeScope: ITreeNodeScope;
            $childNodesScope: ITreeNodesScope;
            $parentNodesScope: ITreeNodesScope;
            $treeScope: ITreeScope; // uiTree scope
            $handleScope: any;
            $type: string; // 'uiTreeNode';

            // Methods
            collapse: () => void;
            expand: () => void;
            toggle: () => void;
            remove: () => ITreeNodeScope; // fra $parentNodesScope.removeNode
            depth: () => number;
            maxSubDepth: () => number;
            isSibling: (targetNode: ITreeNodeScope) => boolean;
            isChild: (targetNode: ITreeNodeScope) => boolean;
        }
    }
}
