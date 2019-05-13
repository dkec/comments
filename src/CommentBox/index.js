import React from "react";
import "./styles.scss";

class CommentBox extends React.Component {
  state = {
    value: "",
    showSuggestion: false,
    users: []
  };

  mentions = [];
  mention = "";
  textareaRef = React.createRef();

  componentDidUpdate() {
    this.textareaRef.current && this.textareaRef.current.focus();
  }

  onChange = event => {
    const { value } = event.target;
    this.setState({ value });
    const regX = /(\B\@([\w\-]+))|@/gi;

    const mentions = value.match(regX);

    if (mentions) {
      const mergedMentions = this.mentions.concat(mentions);
      const uniqueMentions = new Set(mergedMentions);
      const newMentions = Array.from(uniqueMentions);
      const newMention = newMentions[newMentions.length - 1];

      if (newMention === "@") {
        this.setState({ users: this.props.users });
        this.mention = newMention;
        return;
      }

      if (newMention !== this.mention) {
        this.searchUsers(newMention.slice(1));
        this.mention = newMention;
        this.mentions = mentions;

        return;
      }
    } else {
      this.setState({ users: [] });
    }
  };

  hasText(searchIn, text) {
    return searchIn.includes(text);
  }

  searchUsers = text => {
    const { users } = this.props;
    const filteredUsers = users.filter(({ username, name }) => {
      return this.hasText(username, text) || this.hasText(name, text);
    });
    this.setState({ users: filteredUsers });
  };

  selectUser = user => () => {
    let { value } = this.state;
    if (value) {
      const mention = `@${user.username}`;
      if (this.mention === "@") {
        const regX = /@$/gi;
        value = value.replace(regX, mention);
      } else {
        value = value.replace(this.mention, mention);
      }
      this.setState({
        value,
        users: []
      });
      this.mention = mention;
      this.mentions = [...this.mentions, mention];
    } else {
      this.mention = "";
      this.mentions = [];
    }
  };

  createSuggestions() {
    const { users } = this.state;

    const showClassName = users.length ? "--show" : "";
    return (
      <div className={`comment-box__suggestions ${showClassName}`}>
        {users.map(user => {
          const { username, avatar_url, name } = user;
          return (
            <li onClick={this.selectUser(user)}>
              <div className="comment-box__avatar">
                <img src={avatar_url} alt="" />
              </div>
              <div className="comment-box__suggestions__names">
                <b>{username}</b>
                <p>{name}</p>
              </div>
            </li>
          );
        })}
        <div className="comment-box__suggestions__footer">
          People matching '@'
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="comment-box">
        <label>
          comment box <span>Mention people with '@'</span>
        </label>
        <textarea
          value={this.state.value}
          onChange={this.onChange}
          onKeyPress={this.onKeyPress}
          onKeyDown={this.onKeyDown}
          cols="40"
          rows="4"
          ref={this.textareaRef}
        />

        {this.createSuggestions()}
      </div>
    );
  }
}

export default CommentBox;
