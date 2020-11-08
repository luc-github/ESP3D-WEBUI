import { h } from 'preact';
import { useEffect, useState } from "preact/hooks";

const FanPanel = ({ title }) => (
    <div class="panel">
        <div class="panel-header">
            <div class="panel-title">{title}</div>
        </div>
        <div class="panel-nav">
            <p>
                navigation components: tabs, breadcrumbs or pagination
            </p>
        </div>
        <div class="panel-body">
            <p>
                contents
            </p>
        </div>
        <div class="panel-footer">
            <p>
                buttons or inputs
            </p>
        </div>
    </div>
)

export default FanPanel