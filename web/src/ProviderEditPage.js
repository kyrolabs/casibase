// Copyright 2023 The casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from "react";
import {AutoComplete, Button, Card, Col, Input, InputNumber, Row, Select, Slider} from "antd";
import * as ProviderBackend from "./backend/ProviderBackend";
import * as Setting from "./Setting";
import i18next from "i18next";
import {LinkOutlined} from "@ant-design/icons";

const {Option} = Select;

class ProviderEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      providerName: props.match.params.providerName,
      provider: null,
    };
  }

  UNSAFE_componentWillMount() {
    this.getProvider();
  }

  getProvider() {
    ProviderBackend.getProvider("admin", this.state.providerName)
      .then((res) => {
        if (res.status === "ok") {
          this.setState({
            provider: res.data,
          });
        } else {
          Setting.showMessage("error", `Failed to get provider: ${res.msg}`);
        }
      });
  }

  parseProviderField(key, value) {
    if (["topK"].includes(key)) {
      value = Setting.myParseInt(value);
    } else if (["temperature", "topP", "frequencyPenalty", "presencePenalty"].includes(key)) {
      value = Setting.myParseFloat(value);
    }
    return value;
  }

  updateProviderField(key, value) {
    value = this.parseProviderField(key, value);

    const provider = this.state.provider;
    provider[key] = value;
    this.setState({
      provider: provider,
    });
  }

  InputSlider(props) {
    const {
      min,
      max,
      step,
      value,
      onChange,
    } = props;

    return (
      <>
        <Col span={2}>
          <InputNumber
            min={min}
            max={max}
            step={step}
            style={{width: "100%"}}
            value={value}
            onChange={onChange}
          />
        </Col>
        <Col span={20}>
          <Slider
            min={min}
            max={max}
            step={step}
            style={{
              marginLeft: "1%",
              marginRight: "1%",
            }}
            value={value}
            onChange={onChange}
          />
        </Col>
      </>
    );
  }

  renderProvider() {
    return (
      <Card size="small" title={
        <div>
          {i18next.t("provider:Edit Provider")}&nbsp;&nbsp;&nbsp;&nbsp;
          <Button onClick={() => this.submitProviderEdit(false)}>{i18next.t("general:Save")}</Button>
          <Button style={{marginLeft: "20px"}} type="primary" onClick={() => this.submitProviderEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
        </div>
      } style={{marginLeft: "5px"}} type="inner">
        <Row style={{marginTop: "10px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {i18next.t("general:Name")}:
          </Col>
          <Col span={22} >
            <Input value={this.state.provider.name} onChange={e => {
              this.updateProviderField("name", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {i18next.t("general:Display name")}:
          </Col>
          <Col span={22} >
            <Input value={this.state.provider.displayName} onChange={e => {
              this.updateProviderField("displayName", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {i18next.t("provider:Category")}:
          </Col>
          <Col span={22} >
            <Select virtual={false} style={{width: "100%"}} value={this.state.provider.category} onChange={(value => {
              this.updateProviderField("category", value);
              if (value === "Storage") {
                this.updateProviderField("type", "Local File System");
              } else if (value === "Model") {
                this.updateProviderField("type", "OpenAI");
                this.updateProviderField("subType", "gpt-4");
              } else if (value === "Embedding") {
                this.updateProviderField("type", "OpenAI");
                this.updateProviderField("subType", "AdaSimilarity");
              }
            })}>
              {
                [
                  {id: "Storage", name: "Storage"},
                  {id: "Model", name: "Model"},
                  {id: "Embedding", name: "Embedding"},
                ].map((item, index) => <Option key={index} value={item.id}>{item.name}</Option>)
              }
            </Select>
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {i18next.t("provider:Type")}:
          </Col>
          <Col span={22} >
            <Select virtual={false} style={{width: "100%"}} value={this.state.provider.type} onChange={(value => {
              this.updateProviderField("type", value);
              if (this.state.provider.category === "Model") {
                if (value === "OpenAI") {
                  this.updateProviderField("subType", "gpt-4");
                } else if (value === "Gemini") {
                  this.updateProviderField("subType", "gemini-pro");
                } else if (value === "OpenRouter") {
                  this.updateProviderField("subType", "openai/gpt-4");
                } else if (value === "iFlytek") {
                  this.updateProviderField("subType", "spark-v2.0");
                } else if (value === "Ernie") {
                  this.updateProviderField("subType", "ERNIE-Bot");
                } else if (value === "MiniMax") {
                  this.updateProviderField("subType", "abab5-chat");
                } else if (value === "Claude") {
                  this.updateProviderField("subType", "claude-2");
                } else if (value === "Hugging Face") {
                  this.updateProviderField("subType", "gpt2");
                } else if (value === "ChatGLM") {
                  this.updateProviderField("subType", "chatglm2-6b");
                } else if (value === "Local") {
                  this.updateProviderField("subType", "custom-model");
                } else if (value === "Azure") {
                  this.updateProviderField("subType", "gpt-4");
                }
              } else if (this.state.provider.category === "Embedding") {
                if (value === "OpenAI") {
                  this.updateProviderField("subType", "AdaSimilarity");
                } else if (value === "Gemini") {
                  this.updateProviderField("subType", "embedding-001");
                } else if (value === "Hugging Face") {
                  this.updateProviderField("subType", "sentence-transformers/all-MiniLM-L6-v2");
                } else if (value === "Cohere") {
                  this.updateProviderField("subType", "embed-english-v2.0");
                } else if (value === "Ernie") {
                  this.updateProviderField("subType", "default");
                } else if (value === "Local") {
                  this.updateProviderField("subType", "custom-embedding");
                } else if (value === "Azure") {
                  this.updateProviderField("subType", "AdaSimilarity");
                }
              }
            })}>
              {
                Setting.getProviderTypeOptions(this.state.provider.category)
                  // .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item, index) => <Option key={index} value={item.id}>{item.name}</Option>)
              }
            </Select>
          </Col>
        </Row>
        {
          this.state.provider.category === "Storage" ? null : (
            <Row style={{marginTop: "20px"}} >
              <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                {i18next.t("provider:Sub type")}:
              </Col>
              <Col span={22} >
                <Select virtual={false} style={{width: "100%"}} value={this.state.provider.subType} onChange={(value => {this.updateProviderField("subType", value);})}>
                  {
                    Setting.getProviderSubTypeOptions(this.state.provider.category, this.state.provider.type)
                      // .sort((a, b) => a.name.localeCompare(b.name))
                      .map((item, index) => <Option key={index} value={item.id}>{item.name}</Option>)
                  }
                </Select>
              </Col>
            </Row>
          )
        }
        {
          (this.state.provider.type !== "Ernie" && this.state.provider.category !== "Storage") ? null : (
            <Row style={{marginTop: "20px"}} >
              <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                {
                  (this.state.provider.category !== "Storage") ? i18next.t("provider:API key") :
                    i18next.t("provider:Path")}:
              </Col>
              <Col span={22} >
                <Input value={this.state.provider.clientId} onChange={e => {
                  this.updateProviderField("clientId", e.target.value);
                }} />
              </Col>
            </Row>
          )
        }
        {
          this.state.provider.category === "Storage" ? null : (
            <Row style={{marginTop: "20px"}} >
              <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                {i18next.t("provider:Secret key")}:
              </Col>
              <Col span={22} >
                <Input value={this.state.provider.clientSecret} onChange={e => {
                  this.updateProviderField("clientSecret", e.target.value);
                }} />
              </Col>
            </Row>
          )
        }
        {
          (this.state.provider.category === "Model" && this.state.provider.type === "OpenAI") ? (
            <>
              <Row style={{marginTop: "20px"}}>
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {i18next.t("provider:Temperature")}:
                </Col>
                <this.InputSlider
                  min={0}
                  max={2}
                  step={0.01}
                  value={this.state.provider.temperature}
                  onChange={(value) => {
                    this.updateProviderField("temperature", value);
                  }}
                  isMobile={Setting.isMobile()}
                />
              </Row>
              <Row style={{marginTop: "20px"}}>
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {i18next.t("provider:Top P")}:
                </Col>
                <this.InputSlider
                  min={0}
                  max={1}
                  step={0.01}
                  value={this.state.provider.topP}
                  onChange={(value) => {
                    this.updateProviderField("topP", value);
                  }}
                  isMobile={Setting.isMobile()}
                />
              </Row>
              <Row style={{marginTop: "20px"}}>
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {i18next.t("provider:Frequency penalty")}:
                </Col>
                <this.InputSlider
                  label={i18next.t("provider:Frequency penalty")}
                  min={-2}
                  max={2}
                  step={0.01}
                  value={this.state.provider.frequencyPenalty}
                  onChange={(value) => {
                    this.updateProviderField("frequencyPenalty", value);
                  }}
                  isMobile={Setting.isMobile()}
                />
              </Row>
              <Row style={{marginTop: "20px"}}>
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {i18next.t("provider:Presence penalty")}:
                </Col>
                <this.InputSlider
                  label={i18next.t("provider:Presence penalty")}
                  min={-2}
                  max={2}
                  step={0.01}
                  value={this.state.provider.presencePenalty}
                  onChange={(value) => {
                    this.updateProviderField("presencePenalty", value);
                  }}
                  isMobile={Setting.isMobile()}
                />
              </Row>
            </>
          ) : null
        }
        {
          (this.state.provider.category === "Model" && this.state.provider.type === "OpenRouter") ? (
            <>
              <Row style={{marginTop: "20px"}}>
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {i18next.t("provider:Temperature")}:
                </Col>
                <this.InputSlider
                  min={0}
                  max={2}
                  step={0.01}
                  value={this.state.provider.temperature}
                  onChange={(value) => {
                    this.updateProviderField("temperature", value);
                  }}
                  isMobile={Setting.isMobile()}
                />
              </Row>
              <Row style={{marginTop: "20px"}}>
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {i18next.t("provider:Top P")}:
                </Col>
                <this.InputSlider
                  min={0}
                  max={1}
                  step={0.01}
                  value={this.state.provider.topP}
                  onChange={(value) => {
                    this.updateProviderField("topP", value);
                  }}
                  isMobile={Setting.isMobile()}
                />
              </Row>
            </>
          ) : null
        }
        {
          (this.state.provider.category === "Model" && this.state.provider.type === "iFlytek") ? (
            <>
              <Row style={{marginTop: "20px"}}>
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {i18next.t("provider:Temperature")}:
                </Col>
                <this.InputSlider
                  min={0}
                  max={1}
                  step={0.01}
                  value={this.state.provider.temperature}
                  onChange={(value) => {
                    this.updateProviderField("temperature", value);
                  }}
                  isMobile={Setting.isMobile()}
                />
              </Row>
              <Row style={{marginTop: "20px"}}>
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {i18next.t("provider:Top K")}:
                </Col>
                <this.InputSlider
                  min={1}
                  max={6}
                  step={1}
                  value={this.state.provider.topK}
                  onChange={(value) => {
                    this.updateProviderField("topK", value);
                  }}
                  isMobile={Setting.isMobile()}
                />
              </Row>
            </>
          ) : null
        }
        {
          (this.state.provider.category === "Model" && this.state.provider.type === "Ernie") ? (
            <>
              <Row style={{marginTop: "20px"}}>
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {i18next.t("provider:Temperature")}:
                </Col>
                <this.InputSlider
                  min={0.01}
                  max={1}
                  step={0.01}
                  value={this.state.provider.temperature}
                  onChange={(value) => {
                    this.updateProviderField("temperature", value);
                  }}
                  isMobile={Setting.isMobile()}
                />
              </Row>
              <Row style={{marginTop: "20px"}}>
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {i18next.t("provider:Top P")}:
                </Col>
                <this.InputSlider
                  min={0}
                  max={1}
                  step={0.01}
                  value={this.state.provider.topP}
                  onChange={(value) => {
                    this.updateProviderField("topP", value);
                  }}
                  isMobile={Setting.isMobile()}
                />
              </Row>
              <Row style={{marginTop: "20px"}}>
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {i18next.t("provider:Presence penalty")}:
                </Col>
                <this.InputSlider
                  label={i18next.t("provider:Presence penalty")}
                  min={1}
                  max={2}
                  step={0.01}
                  value={this.state.provider.presencePenalty}
                  onChange={(value) => {
                    this.updateProviderField("presencePenalty", value);
                  }}
                  isMobile={Setting.isMobile()}
                />
              </Row>
            </>
          ) : null
        }
        {
          (this.state.provider.category === "Model" && this.state.provider.type === "MiniMax") ? (
            <>
              <Row style={{marginTop: "20px"}}>
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {i18next.t("provider:groupID")}:
                </Col>
                <Col span={22} >
                  <Input value={this.state.provider.clientId} onChange={e => {
                    this.updateProviderField("clientId", e.target.value);
                  }} />
                </Col>
              </Row>
              <Row style={{marginTop: "20px"}}>
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {i18next.t("provider:Temperature")}:
                </Col>
                <this.InputSlider
                  min={0.1}
                  max={1}
                  step={0.1}
                  value={this.state.provider.temperature || 0.7}
                  onChange={(value) => {
                    this.updateProviderField("temperature", value);
                  }}
                  isMobile={Setting.isMobile()}
                />
              </Row>
            </>
          ) : null
        }
        {
          (this.state.provider.category === "Model" && this.state.provider.type === "Gemini") ? (
            <>
              <Row style={{marginTop: "20px"}}>
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {i18next.t("provider:Temperature")}:
                </Col>
                <this.InputSlider
                  min={0}
                  max={2}
                  step={0.01}
                  value={this.state.provider.temperature}
                  onChange={(value) => {
                    this.updateProviderField("temperature", value);
                  }}
                  isMobile={Setting.isMobile()}
                />
              </Row>
              <Row style={{marginTop: "20px"}}>
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {i18next.t("provider:Top P")}:
                </Col>
                <this.InputSlider
                  min={0}
                  max={1}
                  step={0.01}
                  value={this.state.provider.topP}
                  onChange={(value) => {
                    this.updateProviderField("topP", value);
                  }}
                  isMobile={Setting.isMobile()}
                />
              </Row>
              <Row style={{marginTop: "20px"}}>
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {i18next.t("provider:Top K")}:
                </Col>
                <this.InputSlider
                  min={1}
                  max={6}
                  step={1}
                  value={this.state.provider.topK}
                  onChange={(value) => {
                    this.updateProviderField("topK", value);
                  }}
                  isMobile={Setting.isMobile()}
                />
              </Row>
            </>
          ) : null
        }
        {
          ((this.state.provider.category === "Model" || this.state.provider.category === "Embedding") && this.state.provider.type === "Azure") ? (
            <>
              <Row style={{marginTop: "20px"}}>
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {i18next.t("provider:Deployment name")}:
                </Col>
                <Col span={22} >
                  <Input value={this.state.provider.clientId} onChange={e => {
                    this.updateProviderField("clientId", e.target.value);
                  }} />
                </Col>
              </Row>
              <Row style={{marginTop: "20px"}}>
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {i18next.t("provider:API version")}:
                </Col>
                <Col span={22} >
                  <AutoComplete style={{width: "100%"}} value={this.state.provider.apiVersion}
                    options={Setting.getProviderAzureApiVersionOptions().map((item) => Setting.getOption(item.name, item.id))}
                    onChange={(value) => {this.updateProviderField("apiVersion", value);}}
                  />
                </Col>
              </Row>
            </>
          ) : null
        }
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {i18next.t("general:Provider URL")}:
          </Col>
          <Col span={22} >
            <Input prefix={<LinkOutlined />} value={this.state.provider.providerUrl} onChange={e => {
              this.updateProviderField("providerUrl", e.target.value);
            }} />
          </Col>
        </Row>
      </Card>
    );
  }

  submitProviderEdit(exitAfterSave) {
    const provider = Setting.deepCopy(this.state.provider);
    ProviderBackend.updateProvider(this.state.provider.owner, this.state.providerName, provider)
      .then((res) => {
        if (res.status === "ok") {
          if (res.data) {
            Setting.showMessage("success", "Successfully saved");
            this.setState({
              providerName: this.state.provider.name,
            });

            if (exitAfterSave) {
              this.props.history.push("/providers");
            } else {
              this.props.history.push(`/providers/${this.state.provider.name}`);
            }
          } else {
            Setting.showMessage("error", "failed to save: server side failure");
            this.updateProviderField("name", this.state.providerName);
          }
        } else {
          Setting.showMessage("error", `failed to save: ${res.msg}`);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `failed to save: ${error}`);
      });
  }

  render() {
    return (
      <div>
        {
          this.state.provider !== null ? this.renderProvider() : null
        }
        <div style={{marginTop: "20px", marginLeft: "40px"}}>
          <Button size="large" onClick={() => this.submitProviderEdit(false)}>{i18next.t("general:Save")}</Button>
          <Button style={{marginLeft: "20px"}} type="primary" size="large" onClick={() => this.submitProviderEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
        </div>
      </div>
    );
  }
}

export default ProviderEditPage;
