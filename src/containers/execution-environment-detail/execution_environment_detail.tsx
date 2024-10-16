import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { EmptyStateNoData, MarkdownEditor } from '../../components';
import { Section } from '@redhat-cloud-services/frontend-components';
import {
  ClipboardCopy,
  FlexItem,
  Flex,
  Title,
  Button,
} from '@patternfly/react-core';
import './execution-environment-detail.scss';
import { withContainerRepo, IDetailSharedProps } from './base';
import { ExecutionEnvironmentAPI, GroupObjectPermissionType } from '../../api';
import './execution-environment-detail.scss';

interface IState {
  loading: boolean;
  readme: string;
  markdownEditing: boolean;
  redirect: string;
  distribution_id: string;
  groups: GroupObjectPermissionType[];
  description: string;
  namespace: any;
}

class ExecutionEnvironmentDetail extends React.Component<
  IDetailSharedProps,
  IState
> {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      readme: '',
      markdownEditing: false,
      redirect: null,
      distribution_id: '',
      groups: [],
      description: '',
      namespace: {},
    };
  }

  componentDidMount() {
    this.queryReadme(this.props.containerRepository.name);
  }

  render() {
    return this.renderDetail();
  }

  renderDetail() {
    const url = window.location.href.split('://')[1].split('/ui')[0];
    const instructions =
      'podman pull ' +
      url +
      '/' +
      this.props.containerRepository.name +
      ':latest';

    const { containerRepository } = this.props;
    const canEdit = containerRepository.namespace.my_permissions.includes(
      'container.change_containernamespace',
    );

    return (
      <Flex direction={{ default: 'column' }}>
        <FlexItem>
          <Section className='body card-area'>
            {' '}
            <Title headingLevel='h2' size='lg'>
              Instructions
            </Title>
            <Title headingLevel='h3' size='md'>
              Pull this image
            </Title>
            <ClipboardCopy isReadOnly>{instructions}</ClipboardCopy>
          </Section>
        </FlexItem>
        <FlexItem>
          <Section className='body pf-c-content'>
            <Title headingLevel='h2' size='lg'>
              {!this.state.markdownEditing && this.state.readme && canEdit && (
                <Button
                  className={'edit-button'}
                  variant={'primary'}
                  onClick={() => {
                    this.setState({ markdownEditing: true });
                  }}
                >
                  Edit
                </Button>
              )}
            </Title>
            {!this.state.markdownEditing && !this.state.readme ? (
              <EmptyStateNoData
                title={'No README'}
                description={
                  'Add a README with instructions for using this container.'
                }
                button={
                  canEdit ? (
                    <Button
                      variant='primary'
                      onClick={() => this.setState({ markdownEditing: true })}
                    >
                      Add
                    </Button>
                  ) : null
                }
              />
            ) : (
              <MarkdownEditor
                text={this.state.readme}
                placeholder={''}
                helperText={''}
                updateText={value =>
                  this.setState({
                    readme: value,
                  })
                }
                editing={this.state.markdownEditing}
              />
            )}

            {this.state.markdownEditing && (
              <React.Fragment>
                <Button
                  variant={'primary'}
                  onClick={() =>
                    this.saveReadme(
                      this.props.containerRepository.name,
                      this.state.readme,
                    )
                  }
                >
                  Save
                </Button>
                <Button
                  variant={'link'}
                  onClick={() => {
                    this.setState({
                      markdownEditing: false,
                    });
                    this.queryReadme(this.props.containerRepository.name);
                  }}
                >
                  Cancel
                </Button>
              </React.Fragment>
            )}
          </Section>
        </FlexItem>
      </Flex>
    );
  }

  queryReadme(name) {
    this.setState({ loading: true }, () =>
      ExecutionEnvironmentAPI.readme(name)
        .then(result => {
          this.setState({
            readme: result.data.text,
            loading: false,
          });
        })
        .catch(error => this.setState({ redirect: 'notFound' })),
    );
  }

  saveReadme(name, readme) {
    this.setState({ loading: true }, () =>
      ExecutionEnvironmentAPI.saveReadme(name, { text: readme }).then(() => {
        this.setState({
          markdownEditing: false,
          loading: false,
        });
      }),
    );
  }
}

export default withRouter(withContainerRepo(ExecutionEnvironmentDetail));
