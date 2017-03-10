/*--------------------------------------------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------*/

import * as React from "react";
import { Button, DropdownButton, MenuItem } from "react-bootstrap";
import * as API from "../actions/api";
import { versionCompare } from "../utils/util";

interface IBoardProps extends React.Props<any> {
    platform: any;
    installingBoardName: string;
    installErrorMessage: string;
    uninstallingBoardName: string;
    uninstallErrorMessage: string;
    installBoard: (boardName, packageName, arch, version) => void;
    uninstallBoard: (boardName, packagePath) => void;
}

interface IBoardState extends React.Props<any> {
    version: string;
}

export default class BoardView extends React.Component<IBoardProps, IBoardState> {
    constructor(props) {
        super(props);
        this.state = {
            version: "",
        };
        this.versionUpdate = this.versionUpdate.bind(this);
    }

    public render() {
        return (<div className="listitem">
            { this.buildBoardSectionHeader(this.props.platform) }
            { this.buildBoardSectionBody(this.props.platform) }
            { this.buildBoardSecionButtons(this.props.platform) }
        </div>);
    }

    private versionUpdate(eventKey: any, event?: React.SyntheticEvent<{}>): void {
        this.setState({
            version: eventKey,
        });
    }

    private openLink(url) {
        API.openLink(url);
    }

    private buildBoardSectionHeader(p) {
        return (<div>
            <span className="listitem-header">{p.name}</span>
            <span className="listitem-author"> by <span className="listitem-header">{p.package.maintainer}</span></span>
            {
                p.installedVersion && (
                    <span className="listitem-author"> Version {p.installedVersion} <span className="listitem-installed-header">INSTALLED</span>
                    </span>)
            }
        </div>);
    }

    private buildBoardSectionBody(p) {
        const helpLinks = [];
        if (p.help && p.help.online) {
            helpLinks.push({
                url: p.help.online,
                label: "Online help",
            });
        }
        if (p.package.help && p.package.help.online) {
            if (p.help && p.help.online === p.package.help.online) {
                // do nothing.
            } else {
                helpLinks.push({
                    url: p.package.help.online,
                    label: "Online help",
                });
            }
        }
        helpLinks.push({
            url: p.package.websiteURL,
            label: "More info",
        });
        return (<div className="listitem-container">
            <div>
                Boards included in this package:<br/> {p.boards.map((board: any) => board.name).join(", ")}  
            </div>
            {
                helpLinks.map((helpLink, index) => {
                    return (<div key={index}><a className="help-link" onClick={() => this.openLink(helpLink.url)}>{helpLink.label}</a></div>);
                })
            }
        </div>);
    }

    private buildBoardSecionButtons(p) {
        return (<div className="listitem-footer">
            {
                this.props.installingBoardName === p.name && (<div className="toolbar-mask">Installing...</div>)
            }
            {
                this.props.uninstallingBoardName === p.name && (<div className="toolbar-mask">Removing...</div>)
            }
            {
                p.installedVersion && (
                    <div className="right-side">
                        {
                            p.versions && p.versions.length && versionCompare(p.versions[0], p.installedVersion) > 0 && (
                                <Button className="operation-btn"
                                onClick={() => this.props.installBoard(p.name, p.package.name, p.architecture, p.versions[0])}>
                                Update
                                </Button>
                            )
                        }
                        {
                            !p.defaultPlatform && (
                                <Button className="operation-btn" onClick={() => this.props.uninstallBoard(p.name, p.rootBoardPath)}>Remove</Button>
                            )
                        }
                    </div>
                )
            }
            <div className="left-side">
                <DropdownButton id="versionselector" title={this.state.version || "Select version"}
                placeholder="Select version" onSelect={this.versionUpdate}>
                    { p.versions.map((v, index) => {
                        if (v === p.installedVersion) {
                            return "";
                        }
                        return (<MenuItem key={index} eventKey={v} active={v === this.state.version}>{v}</MenuItem>);
                    })}
                </DropdownButton>
                <Button className="operation-btn" disabled={!this.state.version}
                onClick={() => this.props.installBoard(p.name, p.package.name, p.architecture, this.state.version)}>
                Install
                </Button>
            </div>
        </div>);
    }
}