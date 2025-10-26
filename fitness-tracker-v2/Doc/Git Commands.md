# Git Commands Reference Guide

Complete guide to Git commands for version control and collaboration.

---

## Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [Creating Repositories](#creating-repositories)
3. [Basic Commands](#basic-commands)
4. [Branching & Merging](#branching--merging)
5. [Remote Repositories](#remote-repositories)
6. [Stashing](#stashing)
7. [Undoing Changes](#undoing-changes)
8. [Viewing History](#viewing-history)
9. [Tagging](#tagging)
10. [Advanced Commands](#advanced-commands)
11. [Git Workflows](#git-workflows)
12. [Common Scenarios](#common-scenarios)
13. [Git Aliases](#git-aliases)
14. [Troubleshooting](#troubleshooting)

---

## Setup & Configuration

### Initial Setup

```bash
# Set your name (global)
git config --global user.name "Your Name"

# Set your email (global)
git config --global user.email "your.email@example.com"

# Set default editor
git config --global core.editor "code --wait"  # VS Code
git config --global core.editor "vim"          # Vim

# Set default branch name to 'main'
git config --global init.defaultBranch main

# Enable colorful output
git config --global color.ui auto

# Set line ending preferences
git config --global core.autocrlf true   # Windows
git config --global core.autocrlf input  # Mac/Linux
```

### View Configuration

```bash
# List all configuration
git config --list

# List global configuration
git config --global --list

# List local (repository) configuration
git config --local --list

# Get specific config value
git config user.name
git config user.email

# Edit config file directly
git config --global --edit
```

### Configuration Locations

```bash
# System-wide config
/etc/gitconfig

# Global config (user-specific)
~/.gitconfig or ~/.config/git/config

# Local config (repository-specific)
.git/config
```

---

## Creating Repositories

### Initialize a New Repository

```bash
# Initialize in current directory
git init

# Initialize with specific name
git init my-project

# Initialize with specific branch name
git init -b main my-project

# Initialize bare repository (for remote)
git init --bare my-repo.git
```

### Clone an Existing Repository

```bash
# Clone a repository
git clone https://github.com/username/repo.git

# Clone into specific directory
git clone https://github.com/username/repo.git my-folder

# Clone specific branch
git clone -b develop https://github.com/username/repo.git

# Clone with depth (shallow clone)
git clone --depth 1 https://github.com/username/repo.git

# Clone only specific branch
git clone --single-branch --branch main https://github.com/username/repo.git

# Clone with submodules
git clone --recursive https://github.com/username/repo.git
```

---

## Basic Commands

### Checking Status

```bash
# Check repository status
git status

# Short status format
git status -s
git status --short

# Show branch and tracking info
git status -sb
```

### Adding Files

```bash
# Add specific file
git add filename.txt

# Add all files in current directory
git add .

# Add all files in repository
git add -A
git add --all

# Add files interactively
git add -i

# Add parts of files (patch mode)
git add -p
git add --patch

# Add all modified and deleted files (not new files)
git add -u
git add --update

# Add files by pattern
git add *.js
git add src/**/*.ts
```

### Committing Changes

```bash
# Commit with message
git commit -m "Your commit message"

# Commit with multi-line message
git commit -m "Title" -m "Description line 1" -m "Description line 2"

# Add and commit in one command
git commit -am "Your commit message"

# Open editor for commit message
git commit

# Amend last commit (change message)
git commit --amend -m "New message"

# Amend last commit (add files without changing message)
git add forgotten-file.txt
git commit --amend --no-edit

# Commit with empty message (not recommended)
git commit --allow-empty-message -m ""

# Sign commit with GPG
git commit -S -m "Signed commit"
```

### Removing Files

```bash
# Remove file from working directory and staging area
git rm filename.txt

# Remove file from staging area only (keep in working directory)
git rm --cached filename.txt

# Remove directory
git rm -r directory-name/

# Force remove (if file was modified)
git rm -f filename.txt

# Remove files matching pattern
git rm '*.log'
```

### Moving/Renaming Files

```bash
# Rename file
git mv old-name.txt new-name.txt

# Move file to directory
git mv file.txt directory/

# This is equivalent to:
# mv old-name.txt new-name.txt
# git rm old-name.txt
# git add new-name.txt
```

---

## Branching & Merging

### Creating Branches

```bash
# Create new branch
git branch feature-branch

# Create and switch to new branch
git checkout -b feature-branch
git switch -c feature-branch  # Modern alternative

# Create branch from specific commit
git branch feature-branch abc123

# Create branch from remote branch
git checkout -b feature-branch origin/feature-branch

# Create orphan branch (no history)
git checkout --orphan new-branch
```

### Switching Branches

```bash
# Switch to existing branch
git checkout branch-name
git switch branch-name  # Modern alternative

# Switch to previous branch
git checkout -
git switch -

# Create and switch to new branch
git checkout -b new-branch
git switch -c new-branch
```

### Listing Branches

```bash
# List local branches
git branch

# List remote branches
git branch -r

# List all branches (local and remote)
git branch -a

# List branches with last commit
git branch -v

# List branches with tracking info
git branch -vv

# List merged branches
git branch --merged

# List unmerged branches
git branch --no-merged

# List branches containing specific commit
git branch --contains abc123
```

### Deleting Branches

```bash
# Delete local branch (safe - won't delete if unmerged)
git branch -d branch-name

# Force delete local branch
git branch -D branch-name

# Delete remote branch
git push origin --delete branch-name
git push origin :branch-name  # Old syntax

# Delete local tracking branch
git branch -dr origin/branch-name
```

### Merging Branches

```bash
# Merge branch into current branch
git merge feature-branch

# Merge with commit message
git merge feature-branch -m "Merge feature-branch"

# Merge without fast-forward (creates merge commit)
git merge --no-ff feature-branch

# Merge with fast-forward only (fails if not possible)
git merge --ff-only feature-branch

# Abort merge (if conflicts)
git merge --abort

# Continue merge after resolving conflicts
git merge --continue

# Squash merge (combine all commits into one)
git merge --squash feature-branch
git commit -m "Squashed feature-branch"
```

### Rebasing

```bash
# Rebase current branch onto another
git rebase main

# Interactive rebase (last 3 commits)
git rebase -i HEAD~3

# Rebase onto specific commit
git rebase abc123

# Continue rebase after resolving conflicts
git rebase --continue

# Skip current commit during rebase
git rebase --skip

# Abort rebase
git rebase --abort

# Rebase and preserve merge commits
git rebase -p main
git rebase --preserve-merges main

# Rebase onto another branch
git rebase --onto main feature-branch bugfix-branch
```

### Cherry-picking

```bash
# Apply specific commit to current branch
git cherry-pick abc123

# Cherry-pick multiple commits
git cherry-pick abc123 def456

# Cherry-pick range of commits
git cherry-pick abc123..def456

# Cherry-pick without committing
git cherry-pick -n abc123
git cherry-pick --no-commit abc123

# Continue cherry-pick after resolving conflicts
git cherry-pick --continue

# Abort cherry-pick
git cherry-pick --abort
```

---

## Remote Repositories

### Adding Remotes

```bash
# Add remote repository
git remote add origin https://github.com/username/repo.git

# Add multiple remotes
git remote add upstream https://github.com/original/repo.git

# Change remote URL
git remote set-url origin https://github.com/username/new-repo.git

# Add remote with SSH
git remote add origin git@github.com:username/repo.git
```

### Viewing Remotes

```bash
# List remotes
git remote

# List remotes with URLs
git remote -v

# Show remote details
git remote show origin

# Show remote branches
git remote show origin
```

### Removing Remotes

```bash
# Remove remote
git remote remove origin
git remote rm origin

# Rename remote
git remote rename origin new-name
```

### Fetching Changes

```bash
# Fetch from origin
git fetch origin

# Fetch from all remotes
git fetch --all

# Fetch specific branch
git fetch origin main

# Fetch and prune deleted remote branches
git fetch -p
git fetch --prune

# Fetch tags
git fetch --tags
```

### Pulling Changes

```bash
# Pull from current branch's upstream
git pull

# Pull from specific remote and branch
git pull origin main

# Pull with rebase instead of merge
git pull --rebase

# Pull with fast-forward only
git pull --ff-only

# Pull and automatically stash/unstash local changes
git pull --autostash

# Pull all submodules
git pull --recurse-submodules
```

### Pushing Changes

```bash
# Push to origin
git push origin main

# Push current branch to upstream
git push

# Push and set upstream
git push -u origin feature-branch
git push --set-upstream origin feature-branch

# Push all branches
git push --all

# Push all tags
git push --tags

# Push specific tag
git push origin v1.0.0

# Force push (dangerous!)
git push --force
git push -f

# Force push with lease (safer)
git push --force-with-lease

# Delete remote branch
git push origin --delete feature-branch

# Push to different branch name
git push origin local-branch:remote-branch
```

---

## Stashing

### Basic Stashing

```bash
# Stash current changes
git stash

# Stash with message
git stash save "Work in progress on feature X"
git stash push -m "Work in progress on feature X"

# Stash including untracked files
git stash -u
git stash --include-untracked

# Stash including ignored files
git stash -a
git stash --all

# Stash specific files
git stash push -m "Stash specific files" file1.txt file2.txt
```

### Managing Stashes

```bash
# List stashes
git stash list

# Show stash contents
git stash show
git stash show stash@{0}

# Show stash diff
git stash show -p
git stash show -p stash@{1}

# Apply most recent stash
git stash apply

# Apply specific stash
git stash apply stash@{2}

# Apply and remove stash
git stash pop

# Apply specific stash and remove
git stash pop stash@{1}

# Drop specific stash
git stash drop stash@{0}

# Clear all stashes
git stash clear

# Create branch from stash
git stash branch new-branch-name stash@{0}
```

---

## Undoing Changes

### Discard Changes

```bash
# Discard changes in working directory
git checkout -- filename.txt
git restore filename.txt  # Modern alternative

# Discard all changes in working directory
git checkout -- .
git restore .

# Discard changes in specific directory
git checkout -- src/
git restore src/

# Unstage file (keep changes in working directory)
git reset HEAD filename.txt
git restore --staged filename.txt  # Modern alternative

# Unstage all files
git reset HEAD
git restore --staged .
```

### Reset

```bash
# Soft reset (move HEAD, keep changes staged)
git reset --soft HEAD~1

# Mixed reset (move HEAD, unstage changes) - DEFAULT
git reset HEAD~1
git reset --mixed HEAD~1

# Hard reset (move HEAD, discard all changes) - DANGEROUS!
git reset --hard HEAD~1

# Reset to specific commit
git reset --hard abc123

# Reset file to specific commit
git reset abc123 -- filename.txt

# Reset to remote branch state
git reset --hard origin/main
```

### Revert

```bash
# Revert last commit (creates new commit)
git revert HEAD

# Revert specific commit
git revert abc123

# Revert multiple commits
git revert abc123 def456

# Revert range of commits
git revert abc123..def456

# Revert without committing
git revert -n abc123
git revert --no-commit abc123

# Continue revert after resolving conflicts
git revert --continue

# Abort revert
git revert --abort
```

### Clean

```bash
# Show what would be removed (dry run)
git clean -n
git clean --dry-run

# Remove untracked files
git clean -f

# Remove untracked files and directories
git clean -fd

# Remove ignored files too
git clean -fx

# Remove everything (untracked and ignored)
git clean -fdx

# Interactive clean
git clean -i
```

---

## Viewing History

### Log

```bash
# Show commit history
git log

# Show last N commits
git log -5

# One line per commit
git log --oneline

# Show graph
git log --graph
git log --oneline --graph --all

# Show commits with diffs
git log -p
git log --patch

# Show commits with stats
git log --stat

# Show commits in date range
git log --since="2 weeks ago"
git log --after="2024-01-01"
git log --until="2024-12-31"
git log --before="yesterday"

# Show commits by author
git log --author="John Doe"

# Show commits with specific message
git log --grep="fix bug"

# Show commits that modified specific file
git log -- filename.txt
git log --follow -- filename.txt  # Follow renames

# Show commits with specific changes in code
git log -S "function name"
git log -G "regex pattern"

# Custom format
git log --pretty=format:"%h - %an, %ar : %s"
git log --pretty=format:"%C(yellow)%h%C(reset) - %C(green)%an%C(reset), %ar : %s"

# Show merge commits only
git log --merges

# Show non-merge commits only
git log --no-merges

# Show commits between branches
git log main..feature-branch

# Show commits in one branch but not another
git log main...feature-branch
```

### Diff

```bash
# Show unstaged changes
git diff

# Show staged changes
git diff --staged
git diff --cached

# Show changes in specific file
git diff filename.txt

# Show changes between commits
git diff abc123 def456

# Show changes between branches
git diff main feature-branch

# Show changes in specific file between commits
git diff abc123 def456 -- filename.txt

# Show word diff
git diff --word-diff

# Show diff stats
git diff --stat

# Show diff with context lines
git diff -U10  # 10 lines of context

# Ignore whitespace changes
git diff -w
git diff --ignore-all-space
```

### Show

```bash
# Show specific commit
git show abc123

# Show specific file in commit
git show abc123:path/to/file.txt

# Show last commit
git show HEAD

# Show commit before last
git show HEAD~1
git show HEAD^

# Show specific tag
git show v1.0.0

# Show commit with stats
git show --stat abc123
```

### Blame

```bash
# Show who changed each line
git blame filename.txt

# Show specific lines
git blame -L 10,20 filename.txt

# Show email addresses
git blame -e filename.txt

# Ignore whitespace changes
git blame -w filename.txt

# Show original commit
git blame -C filename.txt
```

### Shortlog

```bash
# Show commit counts by author
git shortlog

# Show commit counts only
git shortlog -s

# Show commit counts sorted by number
git shortlog -sn

# Show commits by specific author
git shortlog --author="John Doe"
```

---

## Tagging

### Creating Tags

```bash
# Create lightweight tag
git tag v1.0.0

# Create annotated tag (recommended)
git tag -a v1.0.0 -m "Version 1.0.0"

# Tag specific commit
git tag -a v1.0.0 abc123 -m "Version 1.0.0"

# Sign tag with GPG
git tag -s v1.0.0 -m "Signed version 1.0.0"
```

### Listing Tags

```bash
# List all tags
git tag

# List tags matching pattern
git tag -l "v1.*"
git tag --list "v1.*"

# Show tag details
git show v1.0.0

# List tags with commit info
git tag -n
git tag -n5  # Show 5 lines of annotation
```

### Pushing Tags

```bash
# Push specific tag
git push origin v1.0.0

# Push all tags
git push --tags
git push origin --tags

# Push annotated tags only
git push --follow-tags
```

### Deleting Tags

```bash
# Delete local tag
git tag -d v1.0.0
git tag --delete v1.0.0

# Delete remote tag
git push origin --delete v1.0.0
git push origin :refs/tags/v1.0.0
```

### Checking Out Tags

```bash
# Checkout tag (detached HEAD state)
git checkout v1.0.0

# Create branch from tag
git checkout -b branch-name v1.0.0
```

---

## Advanced Commands

### Bisect (Binary Search for Bugs)

```bash
# Start bisect
git bisect start

# Mark current commit as bad
git bisect bad

# Mark older commit as good
git bisect good abc123

# Git will checkout middle commit - test it
# Then mark as good or bad
git bisect good
# or
git bisect bad

# Continue until bug is found
# Reset after done
git bisect reset

# Automate bisect with script
git bisect start HEAD abc123
git bisect run npm test
git bisect reset
```

### Reflog

```bash
# Show reflog
git reflog

# Show reflog for specific branch
git reflog show main

# Show reflog entries
git reflog show --all

# Recover lost commit
git reflog
git checkout abc123

# Recover deleted branch
git reflog
git checkout -b recovered-branch abc123
```

### Submodules

```bash
# Add submodule
git submodule add https://github.com/user/repo.git path/to/submodule

# Initialize submodules
git submodule init

# Update submodules
git submodule update

# Clone with submodules
git clone --recursive https://github.com/user/repo.git

# Update all submodules to latest
git submodule update --remote

# Remove submodule
git submodule deinit path/to/submodule
git rm path/to/submodule
rm -rf .git/modules/path/to/submodule
```

### Worktrees

```bash
# Create new worktree
git worktree add ../project-feature feature-branch

# List worktrees
git worktree list

# Remove worktree
git worktree remove ../project-feature

# Prune stale worktrees
git worktree prune
```

### Archive

```bash
# Create zip archive
git archive --format=zip HEAD > project.zip

# Create tar archive
git archive --format=tar HEAD > project.tar

# Archive specific branch
git archive --format=zip main > main-branch.zip

# Archive with prefix
git archive --format=zip --prefix=project/ HEAD > project.zip
```

---

## Git Workflows

### Feature Branch Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature main

# 2. Work on feature
git add .
git commit -m "Implement new feature"

# 3. Push to remote
git push -u origin feature/new-feature

# 4. Create pull request (on GitHub/GitLab)

# 5. After review, merge
git checkout main
git pull origin main
git merge feature/new-feature

# 6. Delete branch
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

### Gitflow Workflow

```bash
# Start new feature
git checkout -b feature/my-feature develop
# Work on feature...
git checkout develop
git merge --no-ff feature/my-feature
git branch -d feature/my-feature

# Start release
git checkout -b release/1.0.0 develop
# Prepare release...
git checkout main
git merge --no-ff release/1.0.0
git tag -a v1.0.0 -m "Version 1.0.0"
git checkout develop
git merge --no-ff release/1.0.0
git branch -d release/1.0.0

# Hotfix
git checkout -b hotfix/critical-bug main
# Fix bug...
git checkout main
git merge --no-ff hotfix/critical-bug
git tag -a v1.0.1 -m "Hotfix 1.0.1"
git checkout develop
git merge --no-ff hotfix/critical-bug
git branch -d hotfix/critical-bug
```

### Forking Workflow

```bash
# 1. Fork repository on GitHub

# 2. Clone your fork
git clone https://github.com/your-username/repo.git

# 3. Add upstream remote
git remote add upstream https://github.com/original-owner/repo.git

# 4. Create feature branch
git checkout -b feature/my-feature

# 5. Work on feature
git add .
git commit -m "Add feature"

# 6. Sync with upstream
git fetch upstream
git rebase upstream/main

# 7. Push to your fork
git push origin feature/my-feature

# 8. Create pull request
```

---

## Common Scenarios

### Undo Last Commit (Keep Changes)

```bash
git reset --soft HEAD~1
```

### Undo Last Commit (Discard Changes)

```bash
git reset --hard HEAD~1
```

### Change Last Commit Message

```bash
git commit --amend -m "New message"
```

### Add Files to Last Commit

```bash
git add forgotten-file.txt
git commit --amend --no-edit
```

### Undo Changes to File

```bash
git checkout -- filename.txt
# or
git restore filename.txt
```

### Remove File from Staging

```bash
git reset HEAD filename.txt
# or
git restore --staged filename.txt
```

### Discard All Local Changes

```bash
git reset --hard HEAD
git clean -fd
```

### Update Fork from Original

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### Resolve Merge Conflicts

```bash
# After git merge or git pull with conflicts:

# 1. View conflicts
git status

# 2. Edit files to resolve conflicts

# 3. Mark as resolved
git add conflicted-file.txt

# 4. Complete merge
git commit
# or if rebasing
git rebase --continue
```

### Create Patch File

```bash
# Create patch from last commit
git format-patch -1 HEAD

# Create patch from last 3 commits
git format-patch -3

# Create patch between commits
git format-patch abc123..def456

# Apply patch
git apply patch-file.patch
# or
git am patch-file.patch
```

### Search Git History

```bash
# Find when a line was added/removed
git log -S "search term" --source --all

# Find commits with specific message
git log --grep="bug fix"

# Find who changed a file
git log --follow -- filename.txt

# Find deleted file
git log --all --full-history -- "**/filename.*"
```

### Recover Deleted Branch

```bash
# Find commit of deleted branch
git reflog

# Recreate branch
git checkout -b recovered-branch abc123
```

### Squash Last N Commits

```bash
# Interactive rebase
git rebase -i HEAD~3

# In editor, change 'pick' to 'squash' for commits to squash
# Save and close editor
# Edit commit message
```

### Split Large Commit

```bash
# Reset to before commit
git reset HEAD~1

# Add files in smaller chunks
git add file1.txt
git commit -m "Part 1"

git add file2.txt
git commit -m "Part 2"
```

---

## Git Aliases

### Setup Aliases

```bash
# In ~/.gitconfig or use git config --global alias.<name> '<command>'

[alias]
    # Basic shortcuts
    st = status
    ci = commit
    co = checkout
    br = branch
    
    # Pretty log
    lg = log --oneline --graph --decorate --all
    lol = log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
    
    # Show last commit
    last = log -1 HEAD --stat
    
    # Amend last commit
    amend = commit --amend --no-edit
    
    # Undo last commit
    undo = reset HEAD~1 --mixed
    
    # List aliases
    aliases = config --get-regexp alias
    
    # Quick commit all
    caa = commit -am
    
    # Quick push
    pom = push origin main
    
    # Quick pull
    plom = pull origin main
    
    # Show branches by date
    recent = branch --sort=-committerdate
    
    # Delete merged branches
    cleanup = "!git branch --merged | grep -v '\\*\\|main\\|develop' | xargs -n 1 git branch -d"
    
    # Show contributors
    contributors = shortlog -sn
```

### Using Aliases

```bash
# Use aliases like regular commands
git st
git lg
git caa "Quick commit message"
git pom
```

---

## Troubleshooting

### Fix "Detached HEAD" State

```bash
# Create branch from current position
git checkout -b new-branch

# Or go back to a branch
git checkout main
```

### Fix "Permission Denied" (SSH)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add to ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Add public key to GitHub/GitLab
cat ~/.ssh/id_ed25519.pub
```

### Fix "Merge Conflict"

```bash
# Option 1: Abort merge
git merge --abort

# Option 2: Resolve conflicts
# Edit files, remove conflict markers
git add resolved-file.txt
git commit

# Option 3: Use theirs/ours
git checkout --theirs filename.txt  # Use their version
git checkout --ours filename.txt     # Use our version
git add filename.txt
git commit
```

### Fix "Corrupted Repository"

```bash
# Verify repository
git fsck

# Clean up
git gc

# Repack objects
git repack

# If still corrupted, re-clone
cd ..
rm -rf corrupted-repo
git clone https://github.com/user/repo.git
```

### Fix "Large Files" Error

```bash
# Remove large files from history
git filter-branch --tree-filter 'rm -rf path/to/large-files' HEAD

# Or use BFG Repo-Cleaner
bfg --strip-blobs-bigger-than 100M

# Then force push
git push --force
```

### Fix Accidentally Committed Secrets

```bash
# Remove from last commit
git rm --cached secrets.txt
git commit --amend

# Remove from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch secrets.txt" \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push --force --all
```

### Fix "Please commit your changes or stash them"

```bash
# Stash changes
git stash
git pull
git stash pop

# Or discard changes
git reset --hard HEAD
git pull
```

### Check Git Version

```bash
git --version
```

### Get Help

```bash
# General help
git help

# Help for specific command
git help commit
git commit --help

# Quick help
git commit -h
```

---

## Best Practices

1. **Commit Often**: Make small, logical commits
2. **Write Good Commit Messages**: 
   - First line: short summary (50 chars)
   - Blank line
   - Detailed explanation (72 chars per line)
3. **Use Branches**: Keep main/master stable
4. **Pull Before Push**: Always pull latest changes first
5. **Review Before Commit**: Use `git diff` before committing
6. **Use .gitignore**: Don't commit sensitive or generated files
7. **Never Force Push to Shared Branches**: Except when necessary and coordinated
8. **Tag Releases**: Use semantic versioning (v1.0.0)
9. **Keep Commits Atomic**: One feature/fix per commit
10. **Test Before Push**: Ensure code works before pushing

---

## Quick Reference Card

```bash
# Setup
git config --global user.name "Name"
git config --global user.email "email"

# Create
git init
git clone <url>

# Local Changes
git status
git add <file>
git add .
git commit -m "message"

# Branching
git branch
git branch <name>
git checkout <branch>
git checkout -b <branch>
git merge <branch>

# Remote
git remote -v
git pull
git push
git push origin <branch>

# Undo
git checkout -- <file>
git reset HEAD <file>
git reset --hard HEAD~1

# History
git log
git log --oneline
git diff
git show <commit>

# Stash
git stash
git stash pop
git stash list
```

---

## Resources

- [Official Git Documentation](https://git-scm.com/doc)
- [Pro Git Book](https://git-scm.com/book/en/v2)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Learn Git Branching](https://learngitbranching.js.org/)
- [Oh Shit, Git!?!](https://ohshitgit.com/)

---

**Note**: Replace `<url>`, `<file>`, `<branch>`, `<commit>`, etc. with actual values when using these commands.